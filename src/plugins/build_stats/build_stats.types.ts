import { PluginCommonConfig } from "../../declarations/common";

export type BuildStatsConfigType = {
    outputDir: string;
    outputFile: string;
} & PluginCommonConfig;
