import fs from 'fs';
import path from "path";

import { Compiler, RspackPluginInstance } from "@rspack/core";

import { BuildStatsConfig } from '&declarations/build_stats';
import { LargeModuleConfig } from '&declarations/large_module';
import { EnvValidatorConfig } from '&declarations/env_validator';
import { UnusedModuleConfig } from '&declarations/unused_module';
import { EnvValidatorDefaultSettings } from '&settings/env_validator';
import { UnusedModuleDefaultSettings } from '&settings/ununsed_module';
import { LargeModuleDefaultSettings } from '&settings/large_module';
import { BuildStatsDefaultSettings } from '&settings/build_stats';

import { BuildTracePluginOptions } from './types';
import { DependencyControllerConfig, DependencyControllerConfigType, SupportedExtention, SuspectedDependencyCategories } from '&declarations/dependency_controller';

export class BuildTracePlugin implements RspackPluginInstance {
    
    private readonly buildStatsConfig: BuildStatsConfig = BuildStatsDefaultSettings;
    private readonly largeModuleConfig: LargeModuleConfig = LargeModuleDefaultSettings;
    private readonly envValidatorConfig: EnvValidatorConfig = EnvValidatorDefaultSettings;
    private readonly unusedModuleConfig: UnusedModuleConfig = UnusedModuleDefaultSettings;
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

        compiler.hooks.initialize.tap('EnvValidator', () => {

            if(!this.envValidatorConfig.active) return;
            
            const invalidEnvs: string[] = [];
            const hasValidEnvs = Object.entries(this.envValidatorConfig.envs).every(([key, value]) => {
                const isNil = value === null || value === '' || value === undefined;
                if(isNil) {
                    invalidEnvs.push(key);
                }
                return value;
            });

            if(hasValidEnvs) {
                console.log(`✅ All required environment variables are valid`);
            }
            else {
                console.log(`❌ Some environment variable is not valid: ${invalidEnvs}`);
            }
        });

        compiler.hooks.thisCompilation.tap('UnusedModule', (compilation) => {

            if(!this.unusedModuleConfig.active) return;

            let unusedModulesAmount: number = 0;

            compilation.hooks.finishModules.tap('UnusedModuleFinishModules', (modules) => {
                for(const module of modules) {
                    const isValidResource = module.nameForCondition()?.includes(this.unusedModuleConfig.directory);
                    const hasIncomingConnections = !!compilation.moduleGraph.getIncomingConnections(module).length;
                
                    if(!hasIncomingConnections && isValidResource) {
                        unusedModulesAmount = unusedModulesAmount + 1;
                        const preparedModuleName = module.nameForCondition() || module.identifier();
                        console.log(`Module ${preparedModuleName} has not incoming connections`)
                    }
                }
                const preparedEmoji = !!unusedModulesAmount ? '🔴' : '🥳';
                console.log(`${preparedEmoji} Build has ${unusedModulesAmount} unused modules`);
            });
        });

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
            for(const module of modules) {
                const moduleName = module.nameForCondition();
                const hasValidDirectory = module.context?.includes(this.dependencyControllerConfig.directory);
                const moduleNameParts = module.nameForCondition()?.split('/') || [];
                const moduleFile = moduleNameParts[moduleNameParts?.length - 1];
                const moduleFileParts = moduleFile.split('.');
                const isNodeModule = module.context?.includes('node_modules');
                const moduleExtention = moduleFileParts[moduleFileParts.length - 1];
                const hasValidExtention = this.dependencyControllerConfig.fileExtentions.includes(moduleExtention as SupportedExtention);

                const shouldBeChecked = hasValidDirectory && hasValidExtention && !isNodeModule;
                if(!shouldBeChecked) continue;

                for(const dependency of module.dependencies) {
                    const isSuspected = SuspectedDependencyCategories.includes(dependency.category) || dependency.critical;
                    if(!isSuspected) continue;
                    
                    this.dependencyControllerConfig.suspectedDependencies.push({
                        critical: dependency.critical,
                        name: moduleName ?? 'Unknown',
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
