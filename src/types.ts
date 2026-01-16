import { type AliasPrefix } from "./plugins/alias_tracker";
import { type SupportedExtention } from "./plugins/dependency_controller";

export type BuildTracePluginOptions = {

    /**
     * ununsed module plugin options
     */
    unusedModule?: {
        dir: string;
        skip: string[];
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
    buildFileSize?: boolean;

    /**
     * alias tracker plugin options
     */
    aliasTracker?: {
        aliasPrefix: AliasPrefix;
    };
};
