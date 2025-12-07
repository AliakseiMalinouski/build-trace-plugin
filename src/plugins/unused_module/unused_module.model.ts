import { Compilation } from "@rspack/core";
import { UnusedModuleConfigType } from "./unused_module.types";

export const setupUnusedModulePlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: UnusedModuleConfigType,
}) => {
    if(!config.active) return;

    let unusedModulesAmount: number = 0;

    compilation.hooks.finishModules.tap('UnusedModuleFinishModules', (modules) => {
        for(const module of modules) {
            const isValidResource = module.nameForCondition()?.includes(config.directory);
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
};
