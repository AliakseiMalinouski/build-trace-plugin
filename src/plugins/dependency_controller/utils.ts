import { SupportedExtention, PrepareModuleOutputParams } from "./dependency_controller.types";

export const prepareModuleOutput = ({
    module,
    config,
}: PrepareModuleOutputParams) => {
    const moduleName = module.nameForCondition() ?? 'Unknown';
    const moduleNameParts = module.nameForCondition()?.split('/') || [];
    const isNodeModule = module.context?.includes('node_modules') ?? false;
    const hasValidDirectory = module.context?.includes(config.directory) ?? false;

    const moduleFile = moduleNameParts[moduleNameParts?.length - 1];
    const moduleFileParts = moduleFile.split('.');
    const moduleExtention = moduleFileParts[moduleFileParts.length - 1];
    const hasValidExtention = config.fileExtentions.includes(moduleExtention as SupportedExtention);

    return { moduleName, isNodeModule, hasValidDirectory, hasValidExtention };
};
