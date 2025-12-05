import { PluginCommonConfig } from "../common";

export type EnvValidatorConfigType = {
    envs: Record<string, string | undefined>;
} & PluginCommonConfig;
