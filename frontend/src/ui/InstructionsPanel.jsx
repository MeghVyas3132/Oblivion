export default function InstructionsPanel({ source, isLoading, error, isDirectorThinking }) {
  return (
    <div className="instructions-panel hud-panel">
      <div><strong>Oblivion - Phase 5</strong></div>
      <div>World source: {source}</div>
      {isLoading ? <div>Loading world...</div> : null}
      {error ? <div>Fallback active</div> : null}
      {isDirectorThinking ? <div>AI Director Thinking...</div> : null}
      <div>Move: WASD or Arrow Keys</div>
      <div>Jump: Space</div>
    </div>
  );
}
