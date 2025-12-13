import { UnusedModuleOptions } from "./unused_module.types";

/**
 * default config for unused module plugin
 */
export const UnusedModuleConfig: UnusedModuleOptions = {
    active: false,
    dir: 'src',
    skip: ['test', '__tests__', 'types.ts'],
};
