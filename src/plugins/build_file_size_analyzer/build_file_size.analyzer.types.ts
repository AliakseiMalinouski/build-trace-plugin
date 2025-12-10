import { PluginCommonConfig } from "&declarations/common";

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

export type BuildFileSizeConfigType = {
  outputDir: string;
  outputFile: string;
} & PluginCommonConfig;
