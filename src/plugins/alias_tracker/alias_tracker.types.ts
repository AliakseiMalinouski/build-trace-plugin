import { PluginCommonConfig } from "../../common.types";

export const AliasPrefixes = {
    '@': '@',
};

export type AliasPrefix = keyof typeof AliasPrefixes;

export type AliasTrackerConfigType = {
    aliasPrefix: AliasPrefix;
} & PluginCommonConfig;
