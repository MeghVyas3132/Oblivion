const GROUND_COLOR_BY_ENVIRONMENT = {
  ruins: '#324458',
  forest: '#2f4a36',
  desert: '#726244',
  city: '#3c4452'
};

function enrichObjectShapes(objectList) {
  if (!Array.isArray(objectList) || objectList.length === 0) return [];
  const onlyBoxes = objectList.every((object) => object.shape === 'box');
  if (!onlyBoxes) return objectList;

  return objectList.map((object, index) => {
    if (index % 4 === 1) return { ...object, shape: 'cylinder', materialType: 'stone' };
    if (index % 4 === 2) return { ...object, shape: 'sphere', materialType: 'metal' };
    if (index % 4 === 3) return { ...object, shape: 'cone', materialType: 'stone' };
    return { ...object, materialType: object.materialType ?? 'wood' };
  });
}

function buildEnemyMarkers(enemyCount) {
  if (enemyCount <= 0) return [];

  const radius = 11;
  return Array.from({ length: enemyCount }, (_, index) => {
    const angle = (index / enemyCount) * Math.PI * 2;
    return {
      id: `enemy-${index + 1}`,
      position: [Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius],
      size: [0.8, 1.2, 0.8],
      color: '#c95a5a'
    };
  });
}

export function buildWorldRuntime(blueprint) {
  return {
    ...blueprint,
    groundColor: GROUND_COLOR_BY_ENVIRONMENT[blueprint.environmentType] ?? GROUND_COLOR_BY_ENVIRONMENT.ruins,
    objectList: enrichObjectShapes(blueprint.objectList),
    enemyMarkers: buildEnemyMarkers(blueprint.enemyCount)
  };
}
