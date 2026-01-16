import { Module } from "@rspack/core";

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
}
