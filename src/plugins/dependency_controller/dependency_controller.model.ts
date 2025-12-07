import { Compilation } from "@rspack/core";
import { DependencyControllerConfigType, SuspectedDependency, SuspectedDependencyCategories } from "./dependency_controller.types";
import { prepareModuleOutput } from "./utils";

export const setupDependencyControllerPlugin = ({
    config,
    compilation,
}: {
    compilation: Compilation,
    config: DependencyControllerConfigType,
}) => {
    compilation.hooks.finishModules.tap('DependencyControllerFinishModules', (modules) => {

    if(!config.active) return;

    let suspectedDependencies: SuspectedDependency[] = [];

    for(const module of modules) {
        const {
            moduleName,
            isNodeModule,
            hasValidDirectory,
            hasValidExtention,
        } = prepareModuleOutput({
            module,
            config,
        });

        const shouldBeChecked = hasValidDirectory && hasValidExtention && !isNodeModule;
        if(!shouldBeChecked) continue;

        for(const dependency of module.dependencies) {
            const isSuspected = SuspectedDependencyCategories.includes(dependency.category) || dependency.critical;
            if(!isSuspected) continue;
            
            suspectedDependencies.push({
                name: moduleName,
                critical: dependency.critical,
                category: dependency.category,
            });
        }
    }

    console.log(`\n`);
    if(!suspectedDependencies.length) {
        console.log(`✅ Build has ${suspectedDependencies} modules dependencies!`);
    }
    else {
        console.log(`🧐 Build has ${suspectedDependencies.length} suspected dependencies in modules:`);
        console.table(suspectedDependencies.map(d => ({
            critical: d.critical,
            'dependency category': d.category,
            'module name': d.name.replace(process.cwd(), '.')
        })));
    }

    suspectedDependencies = [];

})};
