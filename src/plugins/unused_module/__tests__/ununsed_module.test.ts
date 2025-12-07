import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Compilation } from "@rspack/core";

import { setupUnusedModulePlugin } from "../unused_module.model";

describe("UnusedModule Plugin", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
  });

  afterEach(() => {
    logSpy.mockReset();
  });

  const mockModule = (name: string, hasIncoming: boolean) => ({
    nameForCondition: () => name,
    identifier: () => name,
    dependencies: [],
  });

  const mockCompilation = (modules: any[], incomingMap: Record<string, boolean>) => {
    return {
      hooks: {
        finishModules: {
          tap: (_: string, callback: (modules: any[]) => void) => {
            callback(modules);
          },
        },
      },
      moduleGraph: {
        getIncomingConnections: (module: any) => {
          return incomingMap[module.nameForCondition()] ? [{}] : [];
        },
      },
    } as unknown as Compilation;
  };

  test("should do nothing when plugin inactive", () => {
    const compilation = mockCompilation([], {});
    setupUnusedModulePlugin({
      compilation,
      config: { active: false, directory: "src" },
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  test("should detect no unused modules", () => {
    const modules = [mockModule("src/module1.ts", true)];
    const compilation = mockCompilation(modules, { "src/module1.ts": true });

    setupUnusedModulePlugin({
      compilation,
      config: { active: true, directory: "src" },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🥳 Build has 0 unused modules");
  });

  test("should detect unused modules", () => {
    const modules = [
      mockModule("src/module1.ts", false),
      mockModule("src/module2.ts", true),
    ];
    const compilation = mockCompilation(modules, { "src/module1.ts": false, "src/module2.ts": true });

    setupUnusedModulePlugin({
      compilation,
      config: { active: true, directory: "src" },
    });

    expect(logSpy).toHaveBeenCalledWith("Module src/module1.ts has not incoming connections");
    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🔴 Build has 1 unused modules");
  });

  test("should ignore modules outside target directory", () => {
    const modules = [mockModule("other/module.ts", false)];
    const compilation = mockCompilation(modules, { "other/module.ts": false });

    setupUnusedModulePlugin({
      compilation,
      config: { active: true, directory: "src" },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🥳 Build has 0 unused modules");
  });
});
