const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function generateWorldBlueprint(prompt) {
  const response = await fetch(`${API_BASE_URL}/generate-world`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`Backend error (${response.status})`);
  }

  return response.json();
}
