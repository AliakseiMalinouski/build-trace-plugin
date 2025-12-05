import { Module } from "@rspack/core";

import { PluginCommonConfig } from "../common";

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

type TSuspectedDependency = {
    name: string;
    category: string;
    critical: boolean;
};

export type DependencyControllerConfigType = Required<{
    suspectedDependencies: TSuspectedDependency[];
} & DependencyControllerPluginOptions & PluginCommonConfig>;

export type PrepareModuleOutputParams = {
    module: Module;
    config: DependencyControllerConfigType;
}
