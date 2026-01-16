import { Compilation } from "@rspack/core";
import { describe, test, expect, vi, beforeEach, Mock } from "vitest";

import { type DependencyControllerConfigType, setupDependencyControllerPlugin } from "../dependency_controller.model";

describe("DependencyController Plugin", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const tableSpy = vi.spyOn(console, "table").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    tableSpy.mockClear();
  });

  const mockModule = (name: string, dependencies: any[] = [], isNodeModule = false) => ({
    nameForCondition: () => name,
    dependencies,
    isNodeModule,
  });

  const mockCompilation = (modules: any[]) => ({
    hooks: {
      finishModules: {
        tap: (_hookName: string, callback: (modules: any[]) => void) => {
          callback(modules);
        },
      },
    },
  } as unknown as Compilation);

  const prepareConfig = (active = true): DependencyControllerConfigType => ({
    active,
    directory: "src",
    fileExtentions: ["ts", "tsx", "js", "jsx"],
  });

  test("should do nothing if plugin inactive", () => {
    const compilation = mockCompilation([]);
    const config = prepareConfig(false);

    setupDependencyControllerPlugin({ compilation, config });

    expect(logSpy).not.toHaveBeenCalled();
    expect(tableSpy).not.toHaveBeenCalled();
  });

  test("should report no suspected dependencies", () => {
    const modules = [mockModule("./src/module1.ts", [{ category: "esm", critical: false }])];
    const compilation = mockCompilation(modules);
    const config = prepareConfig();

    setupDependencyControllerPlugin({ compilation, config });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("✅ Build has 0 modules dependencies!");
    expect(tableSpy).not.toHaveBeenCalled();
  });

  test("should detect suspected dependencies", () => {
    const modules = [
      mockModule("./src/module1.ts", [
        { category: "commonjs", critical: false },
        { category: "unknown", critical: true },
        { category: "esm", critical: false },
      ]),
    ];
    const compilation = mockCompilation(modules);
    const config = prepareConfig();

    setupDependencyControllerPlugin({ compilation, config });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🧐 Build has 2 suspected dependencies in modules:");
    expect(tableSpy).toHaveBeenCalledWith([
      {
        critical: false,
        "dependency category": "commonjs",
        "module name": "./src/module1.ts",
      },
      {
        critical: true,
        "dependency category": "unknown",
        "module name": "./src/module1.ts",
      },
    ]);
  });

  test("should ignore modules outside directory", () => {
    const modules = [mockModule("other/module.ts", [{ category: "commonjs", critical: true }])];
    const compilation = mockCompilation(modules);
    const config = prepareConfig();

    setupDependencyControllerPlugin({ compilation, config });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("✅ Build has 0 modules dependencies!");
    expect(tableSpy).not.toHaveBeenCalled();
  });
});
