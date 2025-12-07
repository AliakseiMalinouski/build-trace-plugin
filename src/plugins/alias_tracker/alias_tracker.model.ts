import { Compilation } from "@rspack/core";

import { AliasPrefix, AliasPrefixes, AliasTrackerConfigType } from "./alias_tracker.types";

const aliasRegex = /[@&][\w\d-_]+/g;

export const setupAliasTrackerPlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: AliasTrackerConfigType,
}) => {
    if(!(config.aliasPrefix in AliasPrefixes)) {
        console.error(`This type of alias is not supported! Supported alias: ${Object.keys(AliasPrefixes).join(',')}`);
        return;
    };
    compilation.hooks.finishModules.tap('AliasTracker', (modules) => {
        const hasNotAliasOption = !('alias' in compilation.options);
        if(hasNotAliasOption) return;

        for(const module of modules) {
            const moduleName = module.nameForCondition() ?? module.context ?? 'Unknown';

            if(moduleName === 'Unknown') continue;

            const includesAlias = !!moduleName?.includes(AliasPrefixes["&"] || AliasPrefixes["@"]);

            if(!includesAlias) continue;

            const matches = moduleName.match(aliasRegex);

            if(!matches || !matches.length) continue;

            const aliasDir = matches[0];

            if(!aliasDir) continue;

            const aliasStats: Record<string, number> = {};

            aliasStats[aliasDir] = (aliasStats[aliasDir] || 0) + 1;

            console.log(`🗃️ Alias stats by usage:`);
            console.table(Object.entries(aliasStats).map(([dir, amount]) => ({
                'alias directory': amount,
            })));
        };
    });
};
