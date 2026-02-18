import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestDirectorUpdate } from '../utils/directorApi';

const DIRECTOR_INTERVAL_MS = 45000;

const FALLBACK_DIRECTIVE = {
  spawnEnemy: 0,
  changeFog: null,
  adjustLighting: null,
  spawnHealth: false
};

function normalizeDirective(input) {
  const safeInput = input && typeof input === 'object' ? input : {};

  return {
    spawnEnemy: Number.isInteger(safeInput.spawnEnemy) && safeInput.spawnEnemy > 0 ? safeInput.spawnEnemy : 0,
    changeFog: safeInput.changeFog && typeof safeInput.changeFog === 'object' ? safeInput.changeFog : null,
    adjustLighting:
      safeInput.adjustLighting && typeof safeInput.adjustLighting === 'object' ? safeInput.adjustLighting : null,
    spawnHealth: safeInput.spawnHealth === true
  };
}

export default function useAIDirector({ worldState, onDirective }) {
  const [isThinking, setIsThinking] = useState(false);
  const [lastDirective, setLastDirective] = useState(FALLBACK_DIRECTIVE);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const worldStateRef = useRef(worldState);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    worldStateRef.current = worldState;
  }, [worldState]);

  const runDirectorUpdate = useCallback(async () => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setIsThinking(true);
    try {
      const rawDirective = await requestDirectorUpdate(worldStateRef.current);
      const normalizedDirective = normalizeDirective(rawDirective);
      setLastDirective(normalizedDirective);
      setLastUpdatedAt(Date.now());
      onDirective(normalizedDirective);
    } catch {
      setLastDirective(FALLBACK_DIRECTIVE);
      setLastUpdatedAt(Date.now());
      onDirective(FALLBACK_DIRECTIVE);
    } finally {
      requestInFlightRef.current = false;
      setIsThinking(false);
    }
  }, [onDirective]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      runDirectorUpdate();
    }, DIRECTOR_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [runDirectorUpdate]);

  return useMemo(
    () => ({
      isThinking,
      lastDirective,
      lastUpdatedAt,
      runDirectorUpdate
    }),
    [isThinking, lastDirective, lastUpdatedAt, runDirectorUpdate]
  );
}
