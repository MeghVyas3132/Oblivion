export default function DirectorPanel({ onRunNow, isThinking }) {
  return (
    <div className="director-panel hud-panel">
      <div><strong>AI Director</strong></div>
      <div>Auto update: every 45s</div>
      <button type="button" onClick={onRunNow} disabled={isThinking}>
        {isThinking ? 'Thinking...' : 'Run Director Now'}
      </button>
    </div>
  );
}
