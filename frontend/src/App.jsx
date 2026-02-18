import { useEffect, useMemo, useState } from 'react';
import InstructionsPanel from './ui/InstructionsPanel';
import WorldPromptPanel from './ui/WorldPromptPanel';
import DirectorPanel from './ui/DirectorPanel';
import GameStatePanel from './ui/GameStatePanel';
import WorldScene from './components/WorldScene';
import useWorldBlueprint from './hooks/useWorldBlueprint';
import useAIDirector from './hooks/useAIDirector';
import { buildDirectorReasoning } from './utils/directorReasoning';

export default function App() {
  const initialPrompt = 'small ruins world with low tension';
  const [prompt, setPrompt] = useState(initialPrompt);
  const [playerHealth] = useState(100);
  const { blueprint, source, isLoading, error, generateWorld, applyDirectorDirective } = useWorldBlueprint();

  const tensionLevel = Math.min(100, Math.round(blueprint.enemyCount * 15 + (100 - playerHealth) * 0.4));
  const worldState = useMemo(
    () => ({
      playerHealth,
      enemyCount: blueprint.enemyCount,
      tensionLevel
    }),
    [playerHealth, blueprint.enemyCount, tensionLevel]
  );

  const { isThinking, lastDirective, lastUpdatedAt, runDirectorUpdate } = useAIDirector({
    worldState,
    onDirective: applyDirectorDirective
  });
  const directorReasoning = useMemo(
    () =>
      buildDirectorReasoning({
        directive: lastDirective,
        worldState,
        hasDirectorUpdate: !!lastUpdatedAt
      }),
    [lastDirective, worldState, lastUpdatedAt]
  );

  useEffect(() => {
    generateWorld(initialPrompt);
  }, [generateWorld]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await generateWorld(prompt);
  };

  return (
    <div className="app-shell">
      <WorldScene blueprint={blueprint} />
      <InstructionsPanel source={source} isLoading={isLoading} error={error} isDirectorThinking={isThinking} />
      <WorldPromptPanel
        prompt={prompt}
        isLoading={isLoading}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
      />
      <DirectorPanel onRunNow={runDirectorUpdate} isThinking={isThinking} />
      <GameStatePanel
        worldState={worldState}
        environmentType={blueprint.environmentType}
        directorReasoning={directorReasoning}
        lastUpdatedAt={lastUpdatedAt}
      />
    </div>
  );
}
