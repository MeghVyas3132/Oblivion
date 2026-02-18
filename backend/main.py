"""FastAPI entrypoint for world generation."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models.schemas import (
    DirectorDirectiveSchema,
    DirectorUpdateRequest,
    WorldBlueprintSchema,
    WorldGenerationRequest,
)
from backend.services.llm_service import generate_director_directive, generate_world_blueprint

app = FastAPI(title="Oblivion Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "phase": "phase-4"}


@app.post("/generate-world", response_model=WorldBlueprintSchema)
def generate_world(request: WorldGenerationRequest) -> WorldBlueprintSchema:
    blueprint = generate_world_blueprint(request.prompt)
    return WorldBlueprintSchema.model_validate(blueprint)


@app.post("/director-update", response_model=DirectorDirectiveSchema)
def director_update(request: DirectorUpdateRequest) -> DirectorDirectiveSchema:
    directive = generate_director_directive(request.model_dump())
    return DirectorDirectiveSchema.model_validate(directive)
