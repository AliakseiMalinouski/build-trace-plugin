import { PluginCommonConfig } from "../../declarations/common";

export type UnusedModuleOptions = {
    dir: string;
    skip?: string[];
} & PluginCommonConfig;
