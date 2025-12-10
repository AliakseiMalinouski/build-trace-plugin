import { Stats } from "@rspack/core";

import { getAssetType } from "./utils";
import { BuildFileSizeConfigType } from "./build_file_size.analyzer.types";

export const setupBuildFileSizeAnalyzer = ({
    stats,
    config,
}: {
    stats: Stats, 
    config: BuildFileSizeConfigType
}) => {

    if(!config.active) return;

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