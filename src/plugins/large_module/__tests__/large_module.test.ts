import { Compilation } from "@rspack/core";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import { setupLargeModulePlugin } from "../large_module.model";

describe("Large Module Plugin", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const tableSpy = vi.spyOn(console, "table").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    tableSpy.mockClear();
  });

  const mockModule = (name: string, size: number, type = "javascript/auto", deps = 0) => ({
    nameForCondition: () => name,
    size: () => size,
    type,
    dependencies: Array(deps).fill({}),
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

  test("should do nothing if plugin inactive", () => {
    const compilation = mockCompilation([]);
    setupLargeModulePlugin({
      compilation,
      config: { active: false, maxFileSize: 1024, directory: "src" },
    });

    expect(logSpy).not.toHaveBeenCalled();
    expect(tableSpy).not.toHaveBeenCalled();
  });

  test("should detect no large modules", () => {
    const modules = [
      mockModule("src/small.ts", 500),
      mockModule("src/another_small.ts", 800),
    ];
    const compilation = mockCompilation(modules);

    setupLargeModulePlugin({
      compilation,
      config: { active: true, maxFileSize: 1024, directory: "src" },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🥳 Build has 0 large modules!");
    expect(tableSpy).not.toHaveBeenCalled();
  });

  test("should detect large modules", () => {
    const modules = [
      mockModule("src/large1.ts", 2048, "javascript/auto", 5),
      mockModule("src/large2.ts", 3072, "javascript/auto", 3),
      mockModule("node_modules/lib.ts", 5000, "javascript/auto", 2),
    ];
    const compilation = mockCompilation(modules);

    setupLargeModulePlugin({
      compilation,
      config: { active: true, maxFileSize: 1024, directory: "src" },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🏔️ Build has large 2 modules:");
    expect(tableSpy).toHaveBeenCalledWith([
      {
        type: "javascript/auto",
        dependencies: 5,
        size: "0.00",
        name: "large1.ts",
      },
      {
        type: "javascript/auto",
        dependencies: 3,
        size: "0.00",
        name: "large2.ts",
      },
    ]);
  });

  test("should ignore modules outside target directory", () => {
    const modules = [
      mockModule("other/large.ts", 2048),
    ];
    const compilation = mockCompilation(modules);

    setupLargeModulePlugin({
      compilation,
      config: { active: true, maxFileSize: 1024, directory: "src" },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith("🥳 Build has 0 large modules!");
    expect(tableSpy).not.toHaveBeenCalled();
  });
});
