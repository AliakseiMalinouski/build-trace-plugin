import { PluginCommonConfig } from "../common";

export type BuildStatsConfigType = {
    outputDir: string;
    outputFile: string;
} & PluginCommonConfig;
