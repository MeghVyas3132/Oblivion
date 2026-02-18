export const SAMPLE_WORLD_BLUEPRINT = {
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
  objectList: [
    {
      id: 'pillar-1',
      shape: 'cylinder',
      position: [-7, 1.6, 4],
      size: [1.6, 3.2, 1.6],
      rotation: [0, 0, 0],
      materialType: 'stone',
      color: '#8f979f'
    },
    {
      id: 'pillar-2',
      shape: 'cylinder',
      position: [0, 1.6, 8],
      size: [1.6, 3.2, 1.6],
      rotation: [0, 0, 0],
      materialType: 'stone',
      color: '#7f8993'
    },
    {
      id: 'orb-1',
      shape: 'sphere',
      position: [5, 1.05, -2],
      size: [2.1, 2.1, 2.1],
      rotation: [0, 0, 0],
      materialType: 'metal',
      color: '#9aa5b1'
    },
    {
      id: 'crate-1',
      shape: 'box',
      position: [-4, 0.55, -3],
      size: [1.2, 1.1, 1.2],
      rotation: [0.05, 0.4, 0],
      materialType: 'wood',
      color: '#8a5f3c'
    },
    {
      id: 'crate-2',
      shape: 'box',
      position: [2, 0.55, -6],
      size: [1.4, 1.1, 1.2],
      rotation: [0, -0.3, 0],
      materialType: 'wood',
      color: '#7d5232'
    },
    {
      id: 'spire-1',
      shape: 'cone',
      position: [7, 1.8, 3],
      size: [1.5, 3.4, 1.5],
      rotation: [0, 0.2, 0],
      materialType: 'stone',
      color: '#748196'
    }
  ],
  enemyCount: 3
};
