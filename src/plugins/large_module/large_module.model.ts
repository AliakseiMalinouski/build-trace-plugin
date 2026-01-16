import { Compilation } from "@rspack/core";
import { styleText } from "util";
import { PluginCommonConfig } from "../../common.types";

export type LargeModule = {
    name: string;
    type: string;
    size: string;
    dependencies: number;
};

export type LargeModuleConfigType = {
    maxFileSize: number;
    directory: string;
} & PluginCommonConfig;

/**
 * default config for large module plugin
 */
export const LargeModuleConfig = {
    active: false,
    directory: 'src',
    maxFileSize: 1024,
};

export const setupLargeModulePlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: LargeModuleConfigType,
}) => {
    if(!config.active) return;

    let largeModules: LargeModule[] = []; 

    compilation.hooks.finishModules.tap('LargeModuleFinishedModules', (modules) => {
        for(const module of modules) {
            const moduleSize = module.size();
            const isLargeModule = 
                !!module.nameForCondition() && 
                moduleSize > config.maxFileSize &&
                module.nameForCondition()?.includes(config.directory) &&
                !module.nameForCondition()?.includes('node_modules');
            if(isLargeModule) {
                largeModules.push({
                    type: module.type,
                    size: `${(module.size() / 1024).toFixed(2)}KB`,
                    dependencies: module.dependencies.length,
                    name: module.nameForCondition() || 'Unknown',
                });
            }
        }
        console.log(`\n`);

        if(largeModules.length) {
            console.log(styleText('yellowBright', `🏔️ Build has large ${largeModules.length} modules:`))
            console.table(largeModules.map((module) => ({
                type: module.type,
                size: module.size,
                dependencies: module.dependencies,
                name: module.name.split('/').pop(),
            })))
        }
        else {
            console.log(styleText('green', `🥳 Build has 0 large modules!`))
        }

        largeModules = [];
    });
};
