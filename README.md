# Oblivion: AI-Directed 3D World Simulator

Browser-based 3D simulation where an LLM generates a world blueprint from a prompt, and an AI Director updates the live world state over time.

## Tech Stack

### Frontend
- React
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/rapier`

### Backend
- FastAPI
- OpenAI-compatible client (supports **Groq** and OpenAI)

## Project Structure

```text
backend/
  main.py
  services/llm_service.py
  models/schemas.py
frontend/
  src/components
  src/systems
  src/hooks
  src/ui
  src/physics
  src/utils
```

## Environment Setup

Create/update `.env` in project root:

```env
# LLM provider: groq | openai | mock
LLM_PROVIDER=groq

# Groq (recommended)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# OpenAI (optional)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

A template is available at `.env.example`.

## Run with Docker (Recommended)

```bash
docker compose up -d --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Health: `http://localhost:8000/health`

Useful commands:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

## Local Development (Without Docker)

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /generate-world`
  - Request: `{ "prompt": "..." }`
  - Response: world blueprint JSON

- `POST /director-update`
  - Request: `{ "playerHealth": number, "enemyCount": number, "tensionLevel": number }`
  - Response: director directive JSON

All AI responses are handled as strict JSON with fallback JSON if provider call fails.

## Gameplay Controls

- Move: `WASD` or Arrow Keys
- Jump: `Space`

## Notes

- `.env` is gitignored.
- If no API key is provided (or provider fails), backend falls back to deterministic mock JSON.
