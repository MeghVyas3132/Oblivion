export const ASSET_QUALITY = {
  lodEnabled: true,
  lodCheckIntervalSeconds: 0.2,
  maxTextureAnisotropy: 8,
  lodDistanceByShape: {
    tree: 28,
    human: 22,
    building: 52,
    streetlight: 30,
    car: 36
  }
};

export const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

export function resolveLodDistance(shape) {
  return ASSET_QUALITY.lodDistanceByShape[shape] ?? 30;
}
