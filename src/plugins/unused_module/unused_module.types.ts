import { PluginCommonConfig } from "../../common.types";

export type UnusedModuleOptions = {
    dir: string;
    skip?: string[];
} & PluginCommonConfig;
