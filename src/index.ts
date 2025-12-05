import fs from 'fs';
import path from "path";
import { Compiler, RspackPluginInstance } from "@rspack/core";

import { EnvValidatorConfig, EnvValidatorConfigType, setupEnvValidatorPlugin } from '&plugins/env_validator';
import { setupUnusedModulePlugin, UnusedModuleConfig, UnusedModuleConfigType } from '&plugins/unused_module';
import { 
    DependencyControllerConfig, 
    DependencyControllerConfigType, 
    SuspectedDependencyCategories, 
    prepareModuleOutput
} from '&plugins/dependency_controller';
import { BuildStatsConfigType, BuildStatsConfig } from '&plugins/build_stats';
import { LargeModuleConfig, LargeModuleConfigType } from '&plugins/large_module';

import { BuildTracePluginOptions } from './types';

export class BuildTracePlugin implements RspackPluginInstance {
    
    private readonly buildStatsConfig: BuildStatsConfigType = BuildStatsConfig;
    private readonly largeModuleConfig: LargeModuleConfigType = LargeModuleConfig;
    private readonly envValidatorConfig: EnvValidatorConfigType = EnvValidatorConfig;
    private readonly unusedModuleConfig: UnusedModuleConfigType = UnusedModuleConfig;
    private dependencyControllerConfig: DependencyControllerConfigType = DependencyControllerConfig;

    constructor (options: BuildTracePluginOptions) {
        
        this.envValidatorConfig = {
            ...this.envValidatorConfig,
            active: !!options.envValidator,
            envs: options.envValidator?.envs ?? this.envValidatorConfig.envs,
        }

        this.unusedModuleConfig = {
            ...this.unusedModuleConfig,
            active: !!options.unusedModule,
            directory: options.unusedModule?.directory ?? this.unusedModuleConfig.directory,
        }

        this.largeModuleConfig = {
            ...this.largeModuleConfig,
            active: !!options.largeModule,
            directory: options.largeModule?.directory ?? this.largeModuleConfig.directory,
            maxFileSize: options.largeModule?.maxFileSize ?? this.largeModuleConfig.maxFileSize
        }

        this.buildStatsConfig = {
            ...this.buildStatsConfig,
            active: !!options.buildStats,
            outputDir: options.buildStats?.outputDir ?? this.buildStatsConfig.outputDir,
        }

        this.dependencyControllerConfig = {
            ...this.dependencyControllerConfig,
            active: !!options.dependencyController,
            directory: options.dependencyController?.directory ?? this.dependencyControllerConfig.directory,
            fileExtentions: options.dependencyController?.fileExtentions ?? this.dependencyControllerConfig.fileExtentions,
        }
    }

    apply (compiler: Compiler) {

        compiler.hooks.initialize.tap('EnvValidator', setupEnvValidatorPlugin({
            config: this.envValidatorConfig,
        }));

        compiler.hooks.thisCompilation.tap('UnusedModule', (compilation) => (
            setupUnusedModulePlugin({
                compilation,
                config: this.unusedModuleConfig,
            })()
        ));

        compiler.hooks.thisCompilation.tap('LargeModule', (compilation) => {

        this.largeModuleConfig.largeModules = [];

        if(!this.largeModuleConfig.active) return;

        compilation.hooks.finishModules.tap('LargeModuleFinishedModules', (modules) => {
            for(const module of modules) {
                const moduleSize = module.size();
                const isLargeModule = 
                    !!module.nameForCondition() && 
                    moduleSize > this.largeModuleConfig.maxFileSize &&
                    module.nameForCondition()?.includes(this.largeModuleConfig.directory) &&
                    !module.nameForCondition()?.includes('node_modules');
                if(isLargeModule) {
                    this.largeModuleConfig.largeModules.push({
                        type: module.type,
                        size: module.size() / 1024,
                        dependencies: module.dependencies.length,
                        name: module.nameForCondition() || 'Unknown',
                    });
                }
            }
            const preparedModulesOutput = this.largeModuleConfig.largeModules.map((largeModule) => 
                `Module: ${largeModule.name} - size ${largeModule.size} KB \n`
            ).join(' ');  
            console.log(`Build has large ${this.largeModuleConfig.largeModules.length} modules: \n ${preparedModulesOutput}`)
        });
    });

    compiler.hooks.thisCompilation.tap('DependencyControllerCompilation', (compilation) => {
        compilation.hooks.finishModules.tap('DependencyControllerFinishModules', (modules) => {

            this.dependencyControllerConfig.suspectedDependencies = [];

            if(!this.dependencyControllerConfig.active) return;

            for(const module of modules) {
                const {
                    moduleName,
                    isNodeModule,
                    hasValidDirectory,
                    hasValidExtention,
                } = prepareModuleOutput({
                    module,
                    config: this.dependencyControllerConfig,
                });

                const shouldBeChecked = hasValidDirectory && hasValidExtention && !isNodeModule;
                if(!shouldBeChecked) continue;

                for(const dependency of module.dependencies) {
                    const isSuspected = SuspectedDependencyCategories.includes(dependency.category) || dependency.critical;
                    if(!isSuspected) continue;
                    
                    this.dependencyControllerConfig.suspectedDependencies.push({
                        name: moduleName,
                        critical: dependency.critical,
                        category: dependency.category,
                    });
                }
            }

            if(!this.dependencyControllerConfig.suspectedDependencies.length) {
                console.log(`✅ Build has ${this.dependencyControllerConfig.suspectedDependencies.length} modules dependencies!`);
            }
            else {
                console.log(`🧐 Build has ${this.dependencyControllerConfig.suspectedDependencies.length} suspected dependencies in modules:`);
                console.table(this.dependencyControllerConfig.suspectedDependencies.map(d => ({
                    critical: d.critical,
                    'dependency category': d.category,
                    'module name': d.name.replace(process.cwd(), '.')
                })));
            }
        });
    });

    compiler.hooks.done.tap('BuildLogger', (stats) => {
      
      if(!this.buildStatsConfig.active) return;

      const time = ((stats.endTime ?? 0) - (stats.startTime ?? 0)) / 1000;

      const info = stats.toJson({ all: false, assets: true });

      const assets = info.assets ?? [];
      const assetsSize = assets.map((asset) => (asset.size / 1024)).reduce((acc, size) => {
        acc = acc + size;
        return acc;
      }, 0).toFixed(0);

      const preparedStats = {
        assetsSize,
        buildNumber: 0,
        time: `${time}s`,
        hash: stats.hash,
        assetsSizeFormat: 'KB',
        hasErrors: stats.hasErrors(),
        hasWarnings: stats.hasWarnings(),
        environment: process.env.NODE_ENV ?? 'production',
      };

      const buildStatsDir = path.join(compiler.context, this.buildStatsConfig.outputDir);

      try {
        const statsFile = path.join(buildStatsDir, this.buildStatsConfig.outputFile);
        const bufferedFile = fs.readFileSync(statsFile);        
        const fileValue: typeof preparedStats = JSON.parse(bufferedFile.toString());

        if(assetsSize > fileValue.assetsSize) {
          const difference = Number(assetsSize) - Number(fileValue.assetsSize);
          console.warn(`📈 Assets size has increased about: ${difference} KB`);
        }
        else {
          console.log('💪 Assets size is normal');
        }

        const updatedStats = {
          ...preparedStats,
          buildNumber: fileValue.buildNumber + 1,
        };

        fs.writeFileSync(
            path.join(buildStatsDir, this.buildStatsConfig.outputFile),
            JSON.stringify(updatedStats, null, 2)
        );        
      }
      catch (e) {
        console.log(`🔴 Could not read build stats file: \n ${e}, \n Creating a new file...`,);

        fs.mkdirSync(buildStatsDir, { recursive: true });
        fs.writeFileSync(
            path.join(buildStatsDir, this.buildStatsConfig.outputFile),
            JSON.stringify(preparedStats, null, 2)
        );      
    }

        console.log('✅ Build has finished successfully');
        console.log(`📊 Build general stats generated in ${this.buildStatsConfig.outputDir}/${this.buildStatsConfig.outputFile}`);
    });
    }
}
