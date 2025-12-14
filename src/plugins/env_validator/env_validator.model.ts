import { styleText } from "util";

import { EnvValidatorConfigType } from "./env_validator.types"

export const setupEnvValidatorPlugin = ({
    config,
}: {
    config: EnvValidatorConfigType,
}) => {
    return () => {
        if(!config.active) return;
            
        const invalidEnvs: string[] = [];

        const hasValidEnvs = Object.entries(config.envs).every(([key, value]) => {
            const isNil = value === null || value === '' || value === undefined;
            if(isNil) {
                invalidEnvs.push(key);
            }
            return value;
        });

        console.log(`\n`);
        
        if(hasValidEnvs) {
            console.log(styleText('green', `✅ Env Validator Plugin: All required environment variables are valid`));
        }
        else {
            console.log(styleText('yellowBright', `❌ Env Validator Plugin: Some environment variable is not valid: ${invalidEnvs}`));
        }
    }
};
