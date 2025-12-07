import { Stats } from "@rspack/core";

import { FilesType, imageFormats } from "./build_file_size.analyzer.types";

export const setupBuildFileSizeAnalyzer = (stats: Stats) => {
        const assets = stats.toJson({ assets: true }).assets;

        if(!assets?.length) {
            console.warn('Build Analyzer: build assets are empty');
            return;
        };

        console.log(`\n`);
        console.log(`📶 Build File Size Plugin: Here are your build files sizes`);

        const isFormat = (assetName: string, format: keyof typeof FilesType) => {
            return assetName.includes(`.${format}`);
        };

        const getAssetType = (assetName: string) => {
            const isJS = isFormat(assetName, FilesType.js);
            const isCSS = isFormat(assetName, FilesType.css);
            const isGIF = isFormat(assetName, FilesType.gif);
            const isImage = imageFormats.some((type) => assetName.includes(type));
            switch(true) {
                case isImage: {
                    return FilesType.image;
                };
                case isJS: {
                    return FilesType.js;
                };
                case isCSS: {
                    return FilesType.css;
                };
                case isGIF: {
                    return FilesType.gif;
                };
                default: {
                    return 'asset';
                };
            }
        }

        console.log(`\n`);
        console.table(assets.map((asset) => ({
            name: asset.name,
            type: getAssetType(asset.name),
            size: `${(asset.size / 1024).toFixed(2)} KB`,   
        })));
}