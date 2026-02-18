"""Pydantic schemas for world blueprint generation."""

from pydantic import BaseModel, Field


class WorldGenerationRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1000)


class LightingSchema(BaseModel):
    ambientIntensity: float
    directionalIntensity: float
    directionalPosition: list[float]
    skyColor: str
    sunPosition: list[float]


class FogSchema(BaseModel):
    color: str
    near: float
    far: float


class ObjectSchema(BaseModel):
    id: str
    shape: str
    position: list[float]
    size: list[float]
    rotation: list[float] | None = None
    materialType: str | None = None
    color: str


class WorldBlueprintSchema(BaseModel):
    environmentType: str
    lighting: LightingSchema
    fog: FogSchema
    objectList: list[ObjectSchema]
    enemyCount: int = Field(ge=0, le=40)


class DirectorUpdateRequest(BaseModel):
    playerHealth: float = Field(ge=0, le=100)
    enemyCount: int = Field(ge=0, le=50)
    tensionLevel: float = Field(ge=0, le=100)


class LightingDirectiveSchema(BaseModel):
    ambientIntensity: float | None = None
    directionalIntensity: float | None = None
    skyColor: str | None = None


class DirectorDirectiveSchema(BaseModel):
    spawnEnemy: int = Field(ge=0, le=5)
    changeFog: FogSchema | None = None
    adjustLighting: LightingDirectiveSchema | None = None
    spawnHealth: bool
