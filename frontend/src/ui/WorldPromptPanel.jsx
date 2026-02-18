export default function WorldPromptPanel({ prompt, isLoading, onPromptChange, onSubmit }) {
  return (
    <form className="prompt-panel hud-panel" onSubmit={onSubmit}>
      <label htmlFor="world-prompt"><strong>World Prompt</strong></label>
      <textarea
        id="world-prompt"
        value={prompt}
        rows={3}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Describe the world..."
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate World'}
      </button>
    </form>
  );
}
