import { SupportedExtention, PrepareModuleOutputParams } from "./dependency_controller.types";

export const prepareModuleOutput = ({
    module,
    config,
}: PrepareModuleOutputParams) => {
    const moduleName = module.nameForCondition() ?? null;
    if(!moduleName) {
        return {
            moduleName: null,
            isNodeModule: false,
            hasValidDirectory: false,
            hasValidExtention: false,
        };
    }
    const moduleNameParts = moduleName.split('/') || [];
    const isNodeModule = moduleName.includes('node_modules');
    const hasValidDirectory = moduleName.includes(config.directory);

    const moduleFile = moduleNameParts[moduleNameParts?.length - 1];
    const moduleFileParts = moduleFile.split('.');
    const moduleExtention = moduleFileParts[moduleFileParts.length - 1];
    const hasValidExtention = config.fileExtentions.includes(moduleExtention as SupportedExtention);

    return { moduleName, isNodeModule, hasValidDirectory, hasValidExtention };
};
