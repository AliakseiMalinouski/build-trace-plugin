import { Compiler, RspackPluginInstance } from "@rspack/core";

import { EnvValidatorConfig, EnvValidatorConfigType, setupEnvValidatorPlugin } from '&plugins/env_validator';
import { setupUnusedModulePlugin, UnusedModuleConfig, UnusedModuleConfigType } from '&plugins/unused_module';
import { 
    DependencyControllerConfig, 
    DependencyControllerConfigType, 
    setupDependencyControllerPlugin
} from '&plugins/dependency_controller';
import { BuildStatsConfigType, BuildStatsConfig, setupBuildStatsPlugin } from '&plugins/build_stats';
import { LargeModuleConfig, LargeModuleConfigType, setupLargeModulePlugin } from '&plugins/large_module';
import { AliasTrackerConfig, AliasTrackerConfigType, setupAliasTrackerPlugin } from "&plugins/alias_tracker";
import { BuildFileSizeAnalyzerConfig, BuildFileSizeConfigType, setupBuildFileSizeAnalyzer } from "&plugins/build_file_size_analyzer";

import { BuildTracePluginOptions } from './types';

export class BuildTracePlugin implements RspackPluginInstance {
    
    private readonly buildStatsConfig: BuildStatsConfigType = BuildStatsConfig;
    private readonly largeModuleConfig: LargeModuleConfigType = LargeModuleConfig;
    private readonly aliasTrackerConfig: AliasTrackerConfigType = AliasTrackerConfig;
    private readonly envValidatorConfig: EnvValidatorConfigType = EnvValidatorConfig;
    private readonly unusedModuleConfig: UnusedModuleConfigType = UnusedModuleConfig;
    private readonly buildFileSizeConfig: BuildFileSizeConfigType = BuildFileSizeAnalyzerConfig;
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
        };

        this.largeModuleConfig = {
            ...this.largeModuleConfig,
            active: !!options.largeModule,
            directory: options.largeModule?.directory ?? this.largeModuleConfig.directory,
            maxFileSize: options.largeModule?.maxFileSize ?? this.largeModuleConfig.maxFileSize
        };

        this.buildStatsConfig = {
            ...this.buildStatsConfig,
            active: !!options.buildStats,
            outputDir: options.buildStats?.outputDir ?? this.buildStatsConfig.outputDir,
        };

        this.dependencyControllerConfig = {
            ...this.dependencyControllerConfig,
            active: !!options.dependencyController,
            directory: options.dependencyController?.directory ?? this.dependencyControllerConfig.directory,
            fileExtentions: options.dependencyController?.fileExtentions ?? this.dependencyControllerConfig.fileExtentions,
        };

        this.buildFileSizeConfig = {
            ...this.buildFileSizeConfig,
            active: !!options.buildFileSize,
            outputDir: options.buildFileSize?.outputDir ?? this.buildFileSizeConfig.outputDir,
            outputFile: options.buildFileSize?.outputFile ?? this.buildFileSizeConfig.outputFile,
        };

        this.aliasTrackerConfig = {
            ...this.aliasTrackerConfig,
            active: !!options.aliasTracker,
            aliasPrefix: options.aliasTracker?.aliasPrefix ?? this.aliasTrackerConfig.aliasPrefix,
        };
    }

    apply (compiler: Compiler) {

    compiler.hooks.initialize.tap('EnvValidator', () => (
        setupEnvValidatorPlugin({
            config: this.envValidatorConfig,
        })
    ));

    compiler.hooks.thisCompilation.tap('UnusedModule', (compilation) => (
        setupUnusedModulePlugin({
            compilation,
            config: this.unusedModuleConfig,
        })
    ));

    compiler.hooks.thisCompilation.tap('LargeModule', (compilation) => (
        setupLargeModulePlugin({
            compilation,
            config: this.largeModuleConfig,
        })
    ));

    compiler.hooks.thisCompilation.tap('DependencyControllerCompilation', (compilation) => (
        setupDependencyControllerPlugin({
            compilation,
            config: this.dependencyControllerConfig,
        })
    ));

    compiler.hooks.thisCompilation.tap('AliasTracker', (compilation) => (
        setupAliasTrackerPlugin({
            compilation,
            config: this.aliasTrackerConfig,
        })
    ));

    compiler.hooks.done.tap('BuildFileSizeAnalyzer', (stats) => (
        setupBuildFileSizeAnalyzer({
            stats, config: this.buildFileSizeConfig,
        })
    ));

    compiler.hooks.done.tap('BuildLogger', (stats) => (
        setupBuildStatsPlugin({
            stats,
            compiler,
            config: this.buildStatsConfig,
        })
    ));
    }
}
