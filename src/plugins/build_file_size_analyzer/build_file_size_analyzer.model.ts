import { Stats } from "@rspack/core";

import { getAssetType } from "./utils";

export const setupBuildFileSizeAnalyzer = (stats: Stats) => {
    const assets = stats.toJson({ assets: true }).assets;

    if(!assets?.length) {
        console.warn('Build Analyzer: build assets are empty');
        return;
    };

    console.log(`\n`);
    console.log(`📶 Build File Size Plugin: Here are your build files sizes`);

    console.table(assets.map((asset) => ({
        name: asset.name,
        type: getAssetType(asset.name),
        size: `${(asset.size / 1024).toFixed(2)} KB`,   
    })));
}