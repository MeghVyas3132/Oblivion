function formatTime(timestamp) {
  if (!timestamp) return 'Not yet';
  return new Date(timestamp).toLocaleTimeString();
}

function tensionLevelLabel(value) {
  if (value >= 75) return 'High';
  if (value >= 40) return 'Medium';
  return 'Low';
}

export default function GameStatePanel({ worldState, environmentType, directorReasoning, lastUpdatedAt }) {
  return (
    <div className="game-state-panel hud-panel">
      <div className="panel-title"><strong>Simulation State</strong></div>
      <div className="state-grid">
        <div>Environment</div>
        <div>{environmentType}</div>
        <div>Player Health</div>
        <div>{worldState.playerHealth}</div>
        <div>Enemy Count</div>
        <div>{worldState.enemyCount}</div>
        <div>Tension</div>
        <div>{worldState.tensionLevel} ({tensionLevelLabel(worldState.tensionLevel)})</div>
        <div>Director Update</div>
        <div>{formatTime(lastUpdatedAt)}</div>
      </div>

      <div className="tension-meter">
        <div className="tension-meter-track">
          <div
            className="tension-meter-fill"
            style={{ width: `${worldState.tensionLevel}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="reasoning-box">{directorReasoning}</div>
    </div>
  );
}
