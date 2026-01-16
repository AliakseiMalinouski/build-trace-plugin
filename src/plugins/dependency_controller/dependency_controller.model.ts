import { Module, Compilation } from "@rspack/core";
import { styleText } from "util";

import { PluginCommonConfig } from "../../common.types";

export const SupportedExtentions = {
    js: 'js',
    ts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
} as const;

export const SuspectedDependencyCategories = ['commonjs', 'unknown'];

export type SupportedExtention = keyof typeof SupportedExtentions;

export type DependencyControllerPluginOptions = {
    directory?: string;
    fileExtentions?: SupportedExtention[];
};

export type SuspectedDependency = {
    name: string;
    category: string;
    critical: boolean;
};

export type DependencyControllerConfigType = Required<DependencyControllerPluginOptions & PluginCommonConfig>;

export type PrepareModuleOutputParams = {
    module: Module;
    config: DependencyControllerConfigType;
};

/**
 * default confg for Dependency Controller Plugin
 */
export const DependencyControllerConfig: DependencyControllerConfigType = {
    active: false,
    directory: 'src',
    fileExtentions: [
        SupportedExtentions.js,
        SupportedExtentions.ts,
        SupportedExtentions.jsx,
        SupportedExtentions.tsx,
    ],
};

export const prepareModuleOutput = ({
    module,
    config,
}: PrepareModuleOutputParams) => {
    const moduleName = module.nameForCondition() ?? null;
    if(!moduleName) {
        return {
            moduleName: null,
            isNodeModule: false,
            hasValidDirectory: false,
            hasValidExtention: false,
        };
    }
    const moduleNameParts = moduleName.split('/') || [];
    const isNodeModule = moduleName.includes('node_modules');
    const hasValidDirectory = moduleName.includes(config.directory);

    const moduleFile = moduleNameParts[moduleNameParts?.length - 1];
    const moduleFileParts = moduleFile.split('.');
    const moduleExtention = moduleFileParts[moduleFileParts.length - 1];
    const hasValidExtention = config.fileExtentions.includes(moduleExtention as SupportedExtention);

    return { moduleName, isNodeModule, hasValidDirectory, hasValidExtention };
};

export const setupDependencyControllerPlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: DependencyControllerConfigType,
}) => {
    compilation.hooks.finishModules.tap('DependencyControllerFinishModules', (modules) => {

    if(!config.active) return;

    let suspectedDependencies: SuspectedDependency[] = [];

    for(const module of modules) {
        const {
            moduleName,
            isNodeModule,
            hasValidDirectory,
            hasValidExtention,
        } = prepareModuleOutput({
            module,
            config,
        });

        const shouldBeChecked = hasValidDirectory && hasValidExtention && !isNodeModule;
        if(!shouldBeChecked) continue;

        for(const dependency of module.dependencies) {
            const isSuspected = SuspectedDependencyCategories.includes(dependency.category) || dependency.critical;
            if(!isSuspected) continue;
            
            suspectedDependencies.push({
                name: moduleName ?? 'Unknown',
                critical: dependency.critical,
                category: dependency.category,
            });
        }
    }

    console.log(`\n`);
    if(!suspectedDependencies.length) {
        console.log(styleText('green', `✅ Build has ${suspectedDependencies.length} modules dependencies!`));
    }
    else {
        console.log(`🧐 Build has ${suspectedDependencies.length} suspected dependencies in modules:`);
        console.table(suspectedDependencies.map(d => ({
            critical: d.critical,
            'dependency category': d.category,
            'module name': d.name.replace(process.cwd(), '.')
        })));
    }

    suspectedDependencies = [];

})};
