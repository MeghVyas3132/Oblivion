const MATERIAL_THEME_BY_TYPE = {
  ruins: 'ruins',
  forest: 'forest',
  desert: 'desert',
  city: 'city',
  stone: 'stone',
  metal: 'metal',
  wood: 'wood',
  foliage: 'foliage',
  asphalt: 'asphalt',
  default: 'stone'
};

const PBR_PROFILE_BY_THEME = {
  ruins: {
    roughness: 0.9,
    metalness: 0.06,
    bumpScale: 0.13,
    normalScale: 0.84,
    aoMapIntensity: 1.08,
    envMapIntensity: 1.05
  },
  forest: {
    roughness: 0.95,
    metalness: 0.03,
    bumpScale: 0.11,
    normalScale: 0.7,
    aoMapIntensity: 0.95,
    envMapIntensity: 0.88
  },
  desert: {
    roughness: 0.9,
    metalness: 0.04,
    bumpScale: 0.1,
    normalScale: 0.64,
    aoMapIntensity: 0.9,
    envMapIntensity: 0.95
  },
  city: {
    roughness: 0.85,
    metalness: 0.14,
    bumpScale: 0.09,
    normalScale: 0.68,
    aoMapIntensity: 1.0,
    envMapIntensity: 1.18
  },
  stone: {
    roughness: 0.88,
    metalness: 0.1,
    bumpScale: 0.12,
    normalScale: 0.85,
    aoMapIntensity: 1.05,
    envMapIntensity: 1.2
  },
  metal: {
    roughness: 0.34,
    metalness: 0.72,
    bumpScale: 0.06,
    normalScale: 0.55,
    aoMapIntensity: 0.75,
    envMapIntensity: 1.55
  },
  wood: {
    roughness: 0.81,
    metalness: 0.08,
    bumpScale: 0.13,
    normalScale: 0.92,
    aoMapIntensity: 1.08,
    envMapIntensity: 1.05
  },
  foliage: {
    roughness: 0.93,
    metalness: 0.02,
    bumpScale: 0.07,
    normalScale: 0.5,
    aoMapIntensity: 0.9,
    envMapIntensity: 0.9
  },
  asphalt: {
    roughness: 0.98,
    metalness: 0.02,
    bumpScale: 0.08,
    normalScale: 0.72,
    aoMapIntensity: 1.1,
    envMapIntensity: 0.95
  }
};

const TEXTURE_OPTIONS_BY_THEME = {
  ruins: { repeat: [10, 10], standardResolution: 1024, highResolution: 2048 },
  forest: { repeat: [11, 11], standardResolution: 1024, highResolution: 2048 },
  desert: { repeat: [9, 9], standardResolution: 1024, highResolution: 2048 },
  city: { repeat: [10, 10], standardResolution: 1024, highResolution: 2048 },
  stone: { repeat: [10, 10], standardResolution: 1024, highResolution: 2048 },
  metal: { repeat: [8, 8], standardResolution: 1024, highResolution: 2048 },
  wood: { repeat: [9, 9], standardResolution: 1024, highResolution: 2048 },
  foliage: { repeat: [12, 12], standardResolution: 1024, highResolution: 2048 },
  asphalt: { repeat: [9, 9], standardResolution: 1024, highResolution: 2048 }
};

export function resolveMaterialTheme(materialType = 'default') {
  return MATERIAL_THEME_BY_TYPE[materialType] ?? MATERIAL_THEME_BY_TYPE.default;
}

export function resolveMaterialProfile(materialType = 'default') {
  const theme = resolveMaterialTheme(materialType);
  return PBR_PROFILE_BY_THEME[theme] ?? PBR_PROFILE_BY_THEME.stone;
}

export function resolveMaterialTextureOptions(materialType = 'default', detailLevel = 'standard') {
  const theme = resolveMaterialTheme(materialType);
  const config = TEXTURE_OPTIONS_BY_THEME[theme] ?? TEXTURE_OPTIONS_BY_THEME.stone;
  return {
    repeat: config.repeat,
    resolution: detailLevel === 'high' ? config.highResolution : config.standardResolution
  };
}
