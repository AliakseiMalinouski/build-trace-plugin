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

export class BuildTracePlugin implements RspackPluginInstance {
    
    private readonly buildStatsConfig: BuildStatsConfig = BuildStatsDefaultSettings;
    private readonly largeModuleConfig: LargeModuleConfig = LargeModuleDefaultSettings;
    private readonly envValidatorConfig: EnvValidatorConfig = EnvValidatorDefaultSettings;
    private readonly unusedModuleConfig: UnusedModuleConfig = UnusedModuleDefaultSettings;

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
