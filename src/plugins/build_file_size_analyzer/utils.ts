import { FilesType, imageFormats } from "./build_file_size.analyzer.types";

export const isFormat = (assetName: string, format: keyof typeof FilesType) => {
    return assetName.includes(`.${format}`);
};

export const getAssetType = (assetName: string) => {
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
