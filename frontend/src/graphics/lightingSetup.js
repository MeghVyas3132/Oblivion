export const DIRECTIONAL_SHADOW_CONFIG = {
  mapSize: 4096,
  cameraFrustum: 35,
  near: 1,
  far: 90,
  bias: -0.00018,
  normalBias: 0.04,
  radius: 3.2
};

export const HDRI_PATH_BY_ENVIRONMENT = {
  ruins: '/assets/hdr/ruins_overcast_2k.hdr',
  forest: '/assets/hdr/forest_day_2k.hdr',
  desert: '/assets/hdr/desert_sunset_2k.hdr',
  city: '/assets/hdr/city_night_2k.hdr'
};

export const HDRI_FALLBACK_PRESET = {
  ruins: 'warehouse',
  forest: 'forest',
  desert: 'sunset',
  city: 'city'
};

export function resolveHdriPath(environmentType) {
  return HDRI_PATH_BY_ENVIRONMENT[environmentType] ?? HDRI_PATH_BY_ENVIRONMENT.ruins;
}

export const SOFT_SHADOW_CONFIG = {
  size: 22,
  samples: 12,
  focus: 0.35
};

export const CONTACT_SHADOW_CONFIG = {
  positionY: 0.02,
  opacity: 0.38,
  width: 38,
  height: 38,
  blur: 2.3,
  far: 24,
  resolution: 1024,
  color: '#000000',
  frames: Infinity
};
