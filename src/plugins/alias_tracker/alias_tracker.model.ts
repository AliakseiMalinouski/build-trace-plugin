import { Compilation } from "@rspack/core";
import { styleText } from "util";

import { PluginCommonConfig } from "../../common.types";

export const AliasPrefixes = {
    '@': '@',
};

export type AliasPrefix = keyof typeof AliasPrefixes;

export type AliasTrackerConfigType = {
    aliasPrefix: AliasPrefix;
} & PluginCommonConfig;

const aliasRegex = /[@&][\w\d-_]+/g;

/**
 * default config for Alias Tracker Plugin
 */
export const AliasTrackerConfig: AliasTrackerConfigType = {
    aliasPrefix: '@',
    active: false,
};

export const setupAliasTrackerPlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: AliasTrackerConfigType,
}) => {

    if(!config.active) return;

    if(!(config.aliasPrefix in AliasPrefixes)) {
        console.error(`This type of alias is not supported! Supported alias: ${Object.keys(AliasPrefixes).join(', ')}`);
        return;
    };
    compilation.hooks.finishModules.tap('AliasTracker', (modules) => {
        const hasNotAliasOption = !('alias' in compilation.options.resolve);
        if(hasNotAliasOption) return;

        const aliasStats: Record<string, number> = {};

        for(const module of modules) {
            const moduleName = module.nameForCondition() ?? module.context ?? 'Unknown';
            if (moduleName === 'Unknown') continue;

            const matches = moduleName.match(aliasRegex);
            if (!matches) continue;

            for (const aliasDir of matches) {
                aliasStats[aliasDir] = (aliasStats[aliasDir] || 0) + 1;
            };
        };

        if(!Object.keys(aliasStats)) return;

        console.log(`\n`);
        console.log(styleText('blueBright', `🗃️ Alias stats by usage:`));
        console.table(Object.entries(aliasStats).map(([dir, amount]) => ({
            amount,
            alias: dir,
        })));
    });
};
