import { PluginCommonConfig } from "../../common.types";

export type BuildStatsConfigType = {
    outputDir: string;
    outputFile: string;
} & PluginCommonConfig;
