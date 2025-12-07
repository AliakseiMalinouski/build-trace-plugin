import { PluginCommonConfig } from "../../declarations/common";

export type LargeModule = {
    name: string;
    type: string;
    size: number;
    dependencies: number;
};

export type LargeModuleConfigType = {
    maxFileSize: number;
    directory: string;
} & PluginCommonConfig;
