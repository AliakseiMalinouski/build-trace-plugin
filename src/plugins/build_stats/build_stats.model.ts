import fs from 'fs';
import path from "path";

import { Compiler, Stats } from "@rspack/core";

import { BuildStatsConfigType } from "./build_stats.types";

export const setupBuildStatsPlugin = ({
    stats,
    config,
    compiler,
}: {
    stats: Stats,
    compiler: Compiler,
    config: BuildStatsConfigType,
}) => {
      
    if(!config.active) return;

    const time = ((stats.endTime ?? 0) - (stats.startTime ?? 0)) / 1000;

    const info = stats.toJson({ all: false, assets: true });

    const assets = info.assets ?? [];
    const assetsSize = assets.map((asset) => (asset.size / 1024)).reduce((acc, size) => {
        acc = acc + size;
        return acc;
    }, 0).toFixed(0);

    const preparedStats = {
        assetsSize,
        buildNumber: 0,
        time: `${time}s`,
        hash: stats.hash,
        assetsSizeFormat: 'KB',
        hasErrors: stats.hasErrors(),
        hasWarnings: stats.hasWarnings(),
        environment: process.env.NODE_ENV ?? 'production',
    };

    const buildStatsDir = path.join(compiler.context, config.outputDir);

    try {
        const statsFile = path.join(buildStatsDir, config.outputFile);
        const bufferedFile = fs.readFileSync(statsFile);        
        const fileValue: typeof preparedStats = JSON.parse(bufferedFile.toString());

        if(assetsSize > fileValue.assetsSize) {
        const difference = Number(assetsSize) - Number(fileValue.assetsSize);
            console.warn(`📈 Assets size has increased about: ${difference} KB`);
        }
        else {
            console.log('💪 Assets size is normal');
        }

        const updatedStats = {
            ...preparedStats,
            buildNumber: fileValue.buildNumber + 1,
        };

        fs.writeFileSync(
            path.join(buildStatsDir, config.outputFile),
            JSON.stringify(updatedStats, null, 2)
        );        
    }
    catch (e) {
        console.log(`🔴 Could not read build stats file: \n ${e}, \n Creating a new file...`,);

        fs.mkdirSync(buildStatsDir, { recursive: true });
        fs.writeFileSync(
            path.join(buildStatsDir, config.outputFile),
            JSON.stringify(preparedStats, null, 2)
        );      
    }

    console.log('✅ Build has finished successfully');
    console.log(`📊 Build general stats generated in ${config.outputDir}/${config.outputFile}`);
};
