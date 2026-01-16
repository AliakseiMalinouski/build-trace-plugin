import { Stats } from "@rspack/core";
import { styleText } from "util";

import { PluginCommonConfig } from "../../common.types";

export const FilesType = {
    js: 'js',
    css: 'css',
    gif: 'gif',
    image: 'image',
} as const;

export const imageFormats = [
  // Raster formats
  "jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "webp", "heic", "heif",
  "avif", "jxl", "j2k", "jp2", "jxr", "hdp", "wdp", "pbm", "pgm", "ppm",
  "pam", "pnm", "dds", "tga", "icns", "ico", "cur", "pcx", "sgi", "ras",

  // HDR / scientific
  "hdr", "exr", "pfm",

  // Vector formats
  "svg", "eps", "pdf", "ai",

  // Photoshop / advanced raster editors
  "psd", "psb", "xcf", "kra",

  // RAW camera formats (the largest group)
  "raw", "arw", "cr2", "cr3", "nef", "nrw", "orf", "rw2", "raf", "sr2", "srf",
  "dng", "erf", "3fr", "fff", "rwl", "pef", "srw", "x3f", "bay", "cap", "iiq",
  "kdc", "mef", "mos", "mqv",

  // Animation formats (image sequences)
  "apng", "mng", "flif",

  // Rare / legacy formats
  "wbmp", "fits", "pgf", "jbig", "jbig2", "bpg", "blp", "ilbm", "iff",
  "pix", "rgb", "rgba", "bw", "cut", "dcx"
];

export type BuildFileSizeConfigType = {} & PluginCommonConfig;

export const BuildFileSizeAnalyzerConfig: BuildFileSizeConfigType = {
    active: false,
};

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
};

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
    console.log(styleText('blueBright', `📶 Build File Size Plugin: Here are your build files sizes`));

    console.table(assets.map((asset) => ({
        name: asset.name,
        type: getAssetType(asset.name),
        size: `${(asset.size / 1024).toFixed(2)} KB`,   
    })));
}