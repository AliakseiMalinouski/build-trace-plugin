import { Compilation } from "@rspack/core";
import { LargeModule, LargeModuleConfigType } from "./large_module.types";

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
                    size: module.size() / 1024,
                    dependencies: module.dependencies.length,
                    name: module.nameForCondition() || 'Unknown',
                });
            }
        }
        const preparedModulesOutput = largeModules.map((largeModule) => 
            `Module: ${largeModule.name} - size ${largeModule.size} KB \n`
        ).join(' ');  

        console.log(`Build has large ${largeModules.length} modules: \n ${preparedModulesOutput}`);

        largeModules = [];
    });
};
