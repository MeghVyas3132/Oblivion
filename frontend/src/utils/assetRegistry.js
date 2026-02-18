const ASSET_REGISTRY = {
  forest: {
    tree: ['/assets/3d/forest/tree_oak_01.glb', '/assets/3d/forest/tree_oak_02.glb', '/assets/3d/forest/tree_pine_01.glb'],
    human: ['/assets/3d/humans/civilian_idle_01.glb', '/assets/3d/humans/civilian_idle_02.glb'],
    building: ['/assets/3d/ruins/ruins_arch_01.glb'],
    streetlight: ['/assets/3d/urban/streetlight_modern_01.glb'],
    car: ['/assets/3d/vehicles/suv_01.glb']
  },
  city: {
    tree: ['/assets/3d/urban/city_tree_01.glb'],
    human: ['/assets/3d/humans/civilian_idle_01.glb', '/assets/3d/humans/civilian_walk_01.glb'],
    building: ['/assets/3d/urban/building_midrise_01.glb', '/assets/3d/urban/building_tower_01.glb'],
    streetlight: ['/assets/3d/urban/streetlight_modern_01.glb'],
    car: ['/assets/3d/vehicles/sedan_01.glb', '/assets/3d/vehicles/suv_01.glb']
  },
  ruins: {
    tree: ['/assets/3d/forest/tree_oak_02.glb'],
    human: ['/assets/3d/humans/civilian_idle_01.glb'],
    building: ['/assets/3d/ruins/ruins_arch_01.glb'],
    streetlight: ['/assets/3d/urban/streetlight_old_01.glb'],
    car: ['/assets/3d/vehicles/sedan_01.glb']
  },
  desert: {
    tree: ['/assets/3d/desert/palm_01.glb'],
    human: ['/assets/3d/humans/civilian_idle_01.glb'],
    building: ['/assets/3d/desert/building_low_01.glb'],
    streetlight: ['/assets/3d/urban/streetlight_old_01.glb'],
    car: ['/assets/3d/vehicles/suv_01.glb']
  }
};

const ASSET_SCALE_MULTIPLIER_BY_FILE = {
  'tree_oak_01.glb': [1.2, 1.2, 1.2],
  'tree_oak_02.glb': [1.1, 1.1, 1.1],
  'tree_pine_01.glb': [1.35, 1.35, 1.35],
  'city_tree_01.glb': [1.15, 1.15, 1.15],
  'palm_01.glb': [1.3, 1.3, 1.3],
  'building_midrise_01.glb': [1.6, 1.6, 1.6],
  'building_tower_01.glb': [2.0, 2.0, 2.0],
  'streetlight_modern_01.glb': [1.05, 1.05, 1.05],
  'streetlight_old_01.glb': [0.95, 0.95, 0.95],
  'sedan_01.glb': [1.1, 1.1, 1.1],
  'suv_01.glb': [1.15, 1.15, 1.15],
  'civilian_idle_01.glb': [1.0, 1.0, 1.0],
  'civilian_idle_02.glb': [1.0, 1.0, 1.0],
  'civilian_walk_01.glb': [1.0, 1.0, 1.0]
};

function collectExpectedAssetPaths() {
  const all = new Set();
  Object.values(ASSET_REGISTRY).forEach((environmentEntry) => {
    Object.values(environmentEntry).forEach((shapePaths) => {
      shapePaths.forEach((path) => all.add(path));
    });
  });
  return [...all].sort();
}

export const EXPECTED_ASSET_PATHS = collectExpectedAssetPaths();

const DEFAULT_ANIMATION_PROFILE = {
  idle: ['idle', 'breathing idle', 'stand', 'default'],
  walk: ['walk', 'walking', 'walkforward'],
  run: ['run', 'running', 'sprint', 'jog']
};

const ANIMATION_PROFILE_BY_SHAPE = {
  human: DEFAULT_ANIMATION_PROFILE
};

function getEnvironmentKey(environmentType) {
  if (environmentType === 'city') return 'city';
  if (environmentType === 'forest') return 'forest';
  if (environmentType === 'desert') return 'desert';
  return 'ruins';
}

export function getAssetPath({ environmentType, shape, index = 0 }) {
  const env = getEnvironmentKey(environmentType);
  const candidates = ASSET_REGISTRY[env]?.[shape] ?? ASSET_REGISTRY.ruins[shape];
  if (!candidates || candidates.length === 0) return null;
  return candidates[Math.abs(index) % candidates.length];
}

export function getAnimationProfile(shape) {
  return ANIMATION_PROFILE_BY_SHAPE[shape] ?? null;
}

function getBaseAssetScale(shape, size) {
  if (shape === 'tree') return [size[0] * 0.45, size[1] * 0.45, size[2] * 0.45];
  if (shape === 'human') return [size[0] * 0.55, size[1] * 0.55, size[2] * 0.55];
  if (shape === 'streetlight') return [size[0] * 0.4, size[1] * 0.38, size[2] * 0.4];
  if (shape === 'building') return [size[0] * 0.2, size[1] * 0.2, size[2] * 0.2];
  if (shape === 'car') return [size[0] * 0.34, size[1] * 0.34, size[2] * 0.34];
  return [1, 1, 1];
}

function extractFileName(path) {
  if (!path) return '';
  const parts = path.split('/');
  return parts[parts.length - 1] || '';
}

export function getAssetScale({ shape, size, url }) {
  const base = getBaseAssetScale(shape, size);
  const fileName = extractFileName(url);
  const multiplier = ASSET_SCALE_MULTIPLIER_BY_FILE[fileName] ?? [1, 1, 1];
  return [base[0] * multiplier[0], base[1] * multiplier[1], base[2] * multiplier[2]];
}
