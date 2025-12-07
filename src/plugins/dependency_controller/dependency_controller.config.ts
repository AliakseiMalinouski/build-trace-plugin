import { DependencyControllerConfigType, SupportedExtentions } from "./dependency_controller.types";

export const DependencyControllerConfig: DependencyControllerConfigType = {
    active: false,
    directory: 'src',
    fileExtentions: [
        SupportedExtentions.js,
        SupportedExtentions.ts,
        SupportedExtentions.jsx,
        SupportedExtentions.tsx,
    ],
};
