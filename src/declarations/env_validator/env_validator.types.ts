import { PluginCommonConfig } from "../common";

export type EnvValidatorConfig = {
    envs: Record<string, string | undefined>;
} & PluginCommonConfig;
