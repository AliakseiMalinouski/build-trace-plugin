import fs from "fs";
import path from "path";
import { Compilation } from "@rspack/core";

import { UnusedModuleOptions } from "./unused_module.types";

function readAllFiles(dir: string, skip: string[]): string[] {
    const result: string[] = [];

    if (!fs.existsSync(dir)) return result;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryName = entry.name;
        const fullPath = path.join(dir, entryName);

        const shouldBeSkipped = skip.some((pattern) => 
            entryName === pattern || 
            fullPath.includes(pattern) ||
            entryName.endsWith(pattern) || 
            entryName.startsWith(pattern) ||
            entryName.includes(pattern)
        );

        if(shouldBeSkipped) continue;

        if (entry.isDirectory()) {
            result.push(...readAllFiles(fullPath, skip));
        } else {
            result.push(fullPath);
        }
    }

    return result;
}

export const setupUnusedModulePlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: UnusedModuleOptions,
}) => {

    if(!config.active) return;

    compilation.hooks.finishModules.tap('UnusedModulePluginFinishModules', () => {
        const usedModuleFiles = new Set<string>();

        for (const module of compilation.modules) {
            const resource = module.nameForCondition?.();
            if (resource) usedModuleFiles.add(path.normalize(resource));
        }

        const allFiles = readAllFiles(config.dir, config.skip ?? []);

        const deadFiles = allFiles.filter((fsPath) => !usedModuleFiles.has(path.normalize(fsPath)));

        if (deadFiles.length) {
            console.log(`\n🔴 Unused files in ${config.dir}:`);
            for (const f of deadFiles) {
                console.log(" - " + f);
            }
        } else {
            console.log(`\n🥳 No unused files in ${config.dir}`);
        }
    });
}
