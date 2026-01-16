import { Stats } from "@rspack/core";
import { beforeEach, test, describe, expect, vi } from "vitest";

import { type BuildFileSizeConfigType, setupBuildFileSizeAnalyzer } from "../build_file_size_analyzer.model";

describe('Build File Size Analyzer Plugin', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});

    beforeEach(() => {
        logSpy.mockClear();
        tableSpy.mockClear();
    });

    const assets = [
        { name: '1.js', size: 1024 },
        { name: '2.css', size: 2048 }
    ];

    const stats = {
        toJson: () => ({ assets })
    } as unknown as Stats;

    test('should log table with assets sizes', () => {
        setupBuildFileSizeAnalyzer({
            stats,
            config: {
                active: true,
            } as BuildFileSizeConfigType
        });

        expect(logSpy).toHaveBeenNthCalledWith(1, '\n');
        expect(logSpy).toHaveBeenNthCalledWith(2, '📶 Build File Size Plugin: Here are your build files sizes');

        expect(tableSpy).toHaveBeenCalledTimes(1);
        expect(tableSpy).toHaveBeenCalledWith([
            { name: '1.js', type: 'js', size: '1.00 KB' },
            { name: '2.css', type: 'css', size: '2.00 KB' }
        ]);
    });
});
