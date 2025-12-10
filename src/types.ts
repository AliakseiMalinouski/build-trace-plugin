import { AliasPrefix } from "./plugins/alias_tracker";
import { SupportedExtention } from "./plugins/dependency_controller";

export type BuildTracePluginOptions = {

    /** env validator plugin options */
    envValidator?: {
        envs: Record<string, string | undefined>;
    };

    /**
     * ununsed module plugin options
     */
    unusedModule?: {
        directory: string;
    };

    /**
     * large module plugin options
     */
    largeModule?: {
        directory: string;
        maxFileSize: number;
    };

    /**
     * build stats plugin options
     */
    buildStats?: {
        outputDir: string;
    };

    /**
     * dependency controller plugin options
     */

    dependencyController?: {
        directory?: string;
        fileExtentions?: SupportedExtention[];
    };

    /**
     * build file size plugin options
     */
    buildFileSize?: {
        outputDir: string;
        outputFile: string;
    };

    /**
     * alias tracker plugin options
     */
    aliasTracker?: {
        aliasPrefix: AliasPrefix;
    };
};
