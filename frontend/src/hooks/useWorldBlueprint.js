import { useCallback, useMemo, useRef, useState } from 'react';
import { SAMPLE_WORLD_BLUEPRINT } from '../utils/sampleWorldBlueprint';
import { normalizeWorldBlueprint } from '../utils/worldBlueprintSchema';
import { generateWorldBlueprint } from '../utils/worldApi';

const HEALTH_PACK_POSITIONS = [
  [-3, 0.5, 2],
  [4, 0.5, -2],
  [0, 0.5, 6],
  [6, 0.5, 6],
  [-6, 0.5, -4]
];

function clampEnemyCount(value) {
  return Math.max(0, Math.min(20, value));
}

export default function useWorldBlueprint() {
  const fallbackBlueprint = useMemo(() => normalizeWorldBlueprint(SAMPLE_WORLD_BLUEPRINT), []);
  const healthPackIndexRef = useRef(0);
  const [blueprint, setBlueprint] = useState(fallbackBlueprint);
  const [source, setSource] = useState('local-fallback');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateWorld = useCallback(
    async (prompt) => {
      setIsLoading(true);
      setError('');

      try {
        const response = await generateWorldBlueprint(prompt);
        setBlueprint(normalizeWorldBlueprint(response));
        setSource('backend');
      } catch (generationError) {
        setBlueprint(fallbackBlueprint);
        setSource('local-fallback');
        setError(generationError instanceof Error ? generationError.message : 'Failed to generate world.');
      } finally {
        setIsLoading(false);
      }
    },
    [fallbackBlueprint]
  );

  const applyDirectorDirective = useCallback((directive) => {
    const safeDirective = directive && typeof directive === 'object' ? directive : {};
    setBlueprint((previousBlueprint) => {
      const nextEnemyCount = clampEnemyCount(
        previousBlueprint.enemyCount + (Number.isInteger(safeDirective.spawnEnemy) ? safeDirective.spawnEnemy : 0)
      );

      const nextFog =
        safeDirective.changeFog && typeof safeDirective.changeFog === 'object'
          ? { ...previousBlueprint.fog, ...safeDirective.changeFog }
          : previousBlueprint.fog;

      const nextLighting =
        safeDirective.adjustLighting && typeof safeDirective.adjustLighting === 'object'
          ? { ...previousBlueprint.lighting, ...safeDirective.adjustLighting }
          : previousBlueprint.lighting;

      let nextObjectList = previousBlueprint.objectList;
      if (safeDirective.spawnHealth === true) {
        const healthPackIndex = healthPackIndexRef.current;
        const position = HEALTH_PACK_POSITIONS[healthPackIndex % HEALTH_PACK_POSITIONS.length];
        healthPackIndexRef.current += 1;

        nextObjectList = [
          ...previousBlueprint.objectList,
          {
            id: `health-pack-${Date.now()}-${healthPackIndex}`,
            shape: 'box',
            position,
            size: [0.6, 0.6, 0.6],
            color: '#5edb8c'
          }
        ];
      }

      return normalizeWorldBlueprint({
        ...previousBlueprint,
        enemyCount: nextEnemyCount,
        fog: nextFog,
        lighting: nextLighting,
        objectList: nextObjectList
      });
    });
  }, []);

  return { blueprint, source, isLoading, error, generateWorld, applyDirectorDirective };
}
