import { PluginCommonConfig } from "&declarations/common";

export type BuildStatsConfig = {
    outputDir: string;
    outputFile: string;
} & PluginCommonConfig;
