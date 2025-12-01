import { PluginCommonConfig } from "../common";

type LargeModule = {
    name: string;
    type: string;
    size: number;
    dependencies: number;
};

export type LargeModuleConfig = {
    maxFileSize: number;
    directory: string;
    largeModules: LargeModule[];
} & PluginCommonConfig;
