export const WORLD_BLUEPRINT_SCHEMA = {
  type: 'object',
  required: ['environmentType', 'lighting', 'fog', 'objectList', 'enemyCount'],
  properties: {
    environmentType: { type: 'string' },
    lighting: {
      type: 'object',
      required: ['ambientIntensity', 'directionalIntensity', 'directionalPosition', 'skyColor', 'sunPosition']
    },
    fog: {
      type: 'object',
      required: ['color', 'near', 'far']
    },
    objectList: { type: 'array' },
    enemyCount: { type: 'integer', minimum: 0 }
  }
};

const DEFAULT_BLUEPRINT = {
  environmentType: 'ruins',
  lighting: {
    ambientIntensity: 0.4,
    directionalIntensity: 1.2,
    directionalPosition: [8, 12, 5],
    skyColor: '#8eb6ff',
    sunPosition: [10, 10, 0]
  },
  fog: {
    color: '#8eb6ff',
    near: 15,
    far: 55
  },
  objectList: [],
  enemyCount: 0
};

function isVector3(value) {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
  );
}

function normalizeObject(object, index) {
  const safeObject = object && typeof object === 'object' ? object : {};
  const shape = ['box', 'sphere', 'cylinder', 'cone', 'tree', 'human', 'building', 'streetlight', 'car'].includes(
    safeObject.shape
  )
    ? safeObject.shape
    : 'box';
  const materialType = ['stone', 'metal', 'wood', 'default', 'foliage', 'asphalt'].includes(safeObject.materialType)
    ? safeObject.materialType
    : 'default';
  return {
    id: typeof safeObject.id === 'string' ? safeObject.id : `object-${index + 1}`,
    shape,
    position: isVector3(safeObject.position) ? safeObject.position : [0, 0.5, 0],
    size: isVector3(safeObject.size) ? safeObject.size : [1, 1, 1],
    rotation: isVector3(safeObject.rotation) ? safeObject.rotation : [0, 0, 0],
    materialType,
    color: typeof safeObject.color === 'string' ? safeObject.color : '#6f8fb9'
  };
}

export function normalizeWorldBlueprint(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const rawLighting = raw.lighting && typeof raw.lighting === 'object' ? raw.lighting : {};
  const rawFog = raw.fog && typeof raw.fog === 'object' ? raw.fog : {};
  const rawObjectList = Array.isArray(raw.objectList) ? raw.objectList : DEFAULT_BLUEPRINT.objectList;

  return {
    environmentType:
      typeof raw.environmentType === 'string' ? raw.environmentType : DEFAULT_BLUEPRINT.environmentType,
    lighting: {
      ambientIntensity:
        typeof rawLighting.ambientIntensity === 'number'
          ? rawLighting.ambientIntensity
          : DEFAULT_BLUEPRINT.lighting.ambientIntensity,
      directionalIntensity:
        typeof rawLighting.directionalIntensity === 'number'
          ? rawLighting.directionalIntensity
          : DEFAULT_BLUEPRINT.lighting.directionalIntensity,
      directionalPosition: isVector3(rawLighting.directionalPosition)
        ? rawLighting.directionalPosition
        : DEFAULT_BLUEPRINT.lighting.directionalPosition,
      skyColor: typeof rawLighting.skyColor === 'string' ? rawLighting.skyColor : DEFAULT_BLUEPRINT.lighting.skyColor,
      sunPosition: isVector3(rawLighting.sunPosition) ? rawLighting.sunPosition : DEFAULT_BLUEPRINT.lighting.sunPosition
    },
    fog: {
      color: typeof rawFog.color === 'string' ? rawFog.color : DEFAULT_BLUEPRINT.fog.color,
      near: typeof rawFog.near === 'number' ? rawFog.near : DEFAULT_BLUEPRINT.fog.near,
      far: typeof rawFog.far === 'number' ? rawFog.far : DEFAULT_BLUEPRINT.fog.far
    },
    objectList: rawObjectList.map(normalizeObject),
    enemyCount:
      Number.isInteger(raw.enemyCount) && raw.enemyCount >= 0 ? raw.enemyCount : DEFAULT_BLUEPRINT.enemyCount
  };
}
