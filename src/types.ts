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
        maxFileSize: number;
    };

    /**
     * build stats plugin flag
     */
    buildStats?: {
        outputDir: string;
    };
};
