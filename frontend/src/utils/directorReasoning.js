function formatDirectiveSummary(directive) {
  const parts = [];

  if (directive.spawnEnemy > 0) {
    parts.push(`spawned ${directive.spawnEnemy} enemy`);
  }
  if (directive.spawnHealth) {
    parts.push('spawned health pickup');
  }
  if (directive.changeFog) {
    parts.push('adjusted fog');
  }
  if (directive.adjustLighting) {
    parts.push('adjusted lighting');
  }

  return parts.length > 0 ? parts.join(', ') : 'kept current world balance';
}

export function buildDirectorReasoning({ directive, worldState, hasDirectorUpdate }) {
  if (!hasDirectorUpdate || !directive) return 'No director decision yet.';

  const { tensionLevel, playerHealth, enemyCount } = worldState;
  const summary = formatDirectiveSummary(directive);

  if (playerHealth < 45) {
    return `Player health is low (${playerHealth}), director ${summary}.`;
  }
  if (tensionLevel < 35) {
    return `Tension is low (${tensionLevel}), director ${summary}.`;
  }
  if (tensionLevel > 75) {
    return `Tension is high (${tensionLevel}), director ${summary}.`;
  }
  return `Enemy count is ${enemyCount}, director ${summary}.`;
}
