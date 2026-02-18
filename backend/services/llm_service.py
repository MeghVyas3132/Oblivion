"""LLM service for world blueprint and AI director generation."""

from __future__ import annotations

import hashlib
import json
import os
import random
from typing import Any

from backend.models.schemas import DirectorDirectiveSchema, WorldBlueprintSchema

FALLBACK_WORLD_BLUEPRINT: dict[str, Any] = {
    "environmentType": "ruins",
    "lighting": {
        "ambientIntensity": 0.4,
        "directionalIntensity": 1.2,
        "directionalPosition": [8, 12, 5],
        "skyColor": "#8eb6ff",
        "sunPosition": [10, 10, 0],
    },
    "fog": {"color": "#8eb6ff", "near": 15, "far": 55},
    "objectList": [
        {
            "id": "pillar-1",
            "shape": "cylinder",
            "position": [-7, 1.6, 4],
            "size": [1.6, 3.2, 1.6],
            "rotation": [0, 0, 0],
            "materialType": "stone",
            "color": "#8f979f",
        },
        {
            "id": "pillar-2",
            "shape": "cylinder",
            "position": [0, 1.6, 8],
            "size": [1.6, 3.2, 1.6],
            "rotation": [0, 0, 0],
            "materialType": "stone",
            "color": "#7f8993",
        },
        {
            "id": "crate-1",
            "shape": "box",
            "position": [-4, 0.55, -3],
            "size": [1.2, 1.1, 1.2],
            "rotation": [0.05, 0.4, 0],
            "materialType": "wood",
            "color": "#8a5f3c",
        },
    ],
    "enemyCount": 3,
}

FALLBACK_DIRECTOR_DIRECTIVE: dict[str, Any] = {
    "spawnEnemy": 0,
    "changeFog": None,
    "adjustLighting": None,
    "spawnHealth": False,
}
DEFAULT_OPENAI_MODEL = "gpt-4.1-mini"
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def _deep_copy(data: dict[str, Any]) -> dict[str, Any]:
    return json.loads(json.dumps(data))


def _prompt_has_any(prompt_text: str, words: list[str]) -> bool:
    return any(word in prompt_text for word in words)


def _seeded_rng(prompt: str) -> random.Random:
    digest = hashlib.md5(prompt.encode("utf-8")).hexdigest()
    seed = int(digest[:8], 16)
    return random.Random(seed)


def _make_object(
    object_id: str,
    shape: str,
    position: list[float],
    size: list[float],
    color: str,
    rotation: list[float] | None = None,
    material_type: str | None = None,
) -> dict[str, Any]:
    return {
        "id": object_id,
        "shape": shape,
        "position": position,
        "size": size,
        "rotation": rotation or [0, 0, 0],
        "materialType": material_type or "default",
        "color": color,
    }


def _merge_blueprint_with_fallback(blueprint: dict[str, Any]) -> dict[str, Any]:
    merged = _deep_copy(FALLBACK_WORLD_BLUEPRINT)

    if not isinstance(blueprint, dict):
        return merged

    if isinstance(blueprint.get("environmentType"), str):
        merged["environmentType"] = blueprint["environmentType"]

    if isinstance(blueprint.get("enemyCount"), int):
        merged["enemyCount"] = blueprint["enemyCount"]

    lighting = blueprint.get("lighting")
    if isinstance(lighting, dict):
        if isinstance(lighting.get("ambientIntensity"), (int, float)):
            merged["lighting"]["ambientIntensity"] = float(lighting["ambientIntensity"])
        if isinstance(lighting.get("directionalIntensity"), (int, float)):
            merged["lighting"]["directionalIntensity"] = float(lighting["directionalIntensity"])
        if isinstance(lighting.get("directionalPosition"), list):
            merged["lighting"]["directionalPosition"] = lighting["directionalPosition"]
        if isinstance(lighting.get("skyColor"), str):
            merged["lighting"]["skyColor"] = lighting["skyColor"]
        if isinstance(lighting.get("sunPosition"), list):
            merged["lighting"]["sunPosition"] = lighting["sunPosition"]

    fog = blueprint.get("fog")
    if isinstance(fog, dict):
        if isinstance(fog.get("color"), str):
            merged["fog"]["color"] = fog["color"]
        if isinstance(fog.get("near"), (int, float)):
            merged["fog"]["near"] = float(fog["near"])
        if isinstance(fog.get("far"), (int, float)):
            merged["fog"]["far"] = float(fog["far"])

    if isinstance(blueprint.get("objectList"), list):
        merged["objectList"] = blueprint["objectList"]

    return merged


def _parse_json_object(content: str | None) -> dict[str, Any] | None:
    if not content:
        return None

    text = content.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
        return None
    except Exception:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None

    try:
        parsed = json.loads(text[start : end + 1])
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        return None

    return None


def _resolve_llm_provider() -> str:
    provider = os.getenv("LLM_PROVIDER", "openai").strip().lower()
    if provider in {"openai", "groq", "mock"}:
        return provider
    return "openai"


def _create_openai_compatible_client(provider: str):
    try:
        from openai import OpenAI  # type: ignore
    except Exception:
        return None, None

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return None, None
        model = os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL)
        return OpenAI(api_key=api_key, base_url=GROQ_BASE_URL), model

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None, None
    model = os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
    return OpenAI(api_key=api_key), model


def _try_llm_json_response(system_prompt: str, user_prompt: str) -> dict[str, Any] | None:
    provider = _resolve_llm_provider()
    if provider == "mock":
        return None

    client, model = _create_openai_compatible_client(provider)
    if not client or not model:
        return None

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        response = client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            messages=messages,
        )
        parsed = _parse_json_object(response.choices[0].message.content)
        if parsed is not None:
            return parsed
    except Exception:
        pass

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
        )
        return _parse_json_object(response.choices[0].message.content)
    except Exception:
        return None


def _generate_forest_objects(prompt_text: str, rng: random.Random) -> list[dict[str, Any]]:
    objects: list[dict[str, Any]] = []

    tree_count = 72
    if _prompt_has_any(prompt_text, ["dense", "thick", "deep"]):
        tree_count = 110
    if _prompt_has_any(prompt_text, ["small", "tiny"]):
        tree_count = 48

    canopy_color = "#4fa564" if "green" in prompt_text else "#4c8d52"

    for index in range(tree_count):
        x = rng.uniform(-18, 18)
        z = rng.uniform(-18, 18)
        if abs(x) < 3.8 and abs(z - 5) < 5:
            continue
        height = rng.uniform(5.4, 9.4)
        width = rng.uniform(1.6, 2.8)
        objects.append(
            _make_object(
                f"tree-{index}",
                "tree",
                [x, height * 0.5, z],
                [width, height, width],
                canopy_color,
                [0, rng.uniform(0, 0.2), 0],
                "wood",
            )
        )

    for index in range(16):
        objects.append(
            _make_object(
                f"rock-{index}",
                "sphere",
                [rng.uniform(-16, 16), rng.uniform(0.25, 0.65), rng.uniform(-16, 16)],
                [rng.uniform(0.5, 1.2), rng.uniform(0.45, 1.1), rng.uniform(0.5, 1.2)],
                "#77828c",
                [0, 0, 0],
                "stone",
            )
        )

    human_count = 8
    if _prompt_has_any(prompt_text, ["crowd", "many people", "village"]):
        human_count = 16
    if _prompt_has_any(prompt_text, ["no people", "empty"]):
        human_count = 0

    for index in range(human_count):
        objects.append(
            _make_object(
                f"human-{index}",
                "human",
                [rng.uniform(-9, 9), 0.95, rng.uniform(-9, 9)],
                [0.8, 1.9, 0.8],
                "#d6b6a3",
                [0, rng.uniform(0, 6.28), 0],
                "default",
            )
        )

    return objects


def _generate_city_objects(prompt_text: str, rng: random.Random, is_night: bool) -> list[dict[str, Any]]:
    objects: list[dict[str, Any]] = []

    building_index = 0
    for x in range(-18, 19, 4):
        for z in range(-18, 19, 4):
            if abs(x) < 5 or abs(z) < 5:
                continue
            width = rng.uniform(2.3, 4.6)
            depth = rng.uniform(2.3, 4.6)
            height = rng.uniform(6, 16)
            if _prompt_has_any(prompt_text, ["downtown", "skyscraper", "highrise"]):
                height = rng.uniform(12, 26)
            objects.append(
                _make_object(
                    f"building-{building_index}",
                    "building",
                    [x + rng.uniform(-0.8, 0.8), height * 0.5, z + rng.uniform(-0.8, 0.8)],
                    [width, height, depth],
                    "#6f7683" if is_night else "#848b97",
                    [0, rng.uniform(-0.15, 0.15), 0],
                    "stone",
                )
            )
            building_index += 1

    lamp_index = 0
    for axis_value in range(-18, 19, 3):
        objects.append(
            _make_object(
                f"streetlight-a-{lamp_index}",
                "streetlight",
                [3.4, 2.3, axis_value],
                [0.3, 4.6, 0.3],
                "#c9b27a" if is_night else "#9ea4ad",
                [0, 0, 0],
                "metal",
            )
        )
        objects.append(
            _make_object(
                f"streetlight-b-{lamp_index}",
                "streetlight",
                [-3.4, 2.3, axis_value],
                [0.3, 4.6, 0.3],
                "#c9b27a" if is_night else "#9ea4ad",
                [0, 3.14, 0],
                "metal",
            )
        )
        lamp_index += 1

    for index in range(12):
        lane = -1 if index % 2 == 0 else 1
        objects.append(
            _make_object(
                f"car-{index}",
                "car",
                [rng.uniform(-14, 14), 0.62, lane * rng.uniform(1.1, 2.2)],
                [1.9, 1.0, 3.7],
                "#a93f3f" if index % 3 == 0 else "#3f6ca9",
                [0, 0 if lane < 0 else 3.14, 0],
                "metal",
            )
        )

    human_count = 14
    if _prompt_has_any(prompt_text, ["crowded", "busy", "festival"]):
        human_count = 24
    if _prompt_has_any(prompt_text, ["empty", "abandoned"]):
        human_count = 0

    for index in range(human_count):
        side = -1 if index % 2 == 0 else 1
        objects.append(
            _make_object(
                f"human-{index}",
                "human",
                [rng.uniform(-16, 16), 0.95, side * rng.uniform(5.8, 9.6)],
                [0.8, 1.9, 0.8],
                "#d6b6a3",
                [0, rng.uniform(0, 6.28), 0],
                "default",
            )
        )

    for index in range(10):
        objects.append(
            _make_object(
                f"city-tree-{index}",
                "tree",
                [rng.uniform(-16, 16), 2.5, rng.choice([-10.5, -9.2, 9.2, 10.5])],
                [1.4, 5.0, 1.4],
                "#4e7f59",
                [0, rng.uniform(0, 6.28), 0],
                "wood",
            )
        )

    return objects


def _generate_ruins_objects(rng: random.Random) -> list[dict[str, Any]]:
    objects = _deep_copy(FALLBACK_WORLD_BLUEPRINT["objectList"])
    for index in range(10):
        objects.append(
            _make_object(
                f"ruins-column-{index}",
                "cylinder",
                [rng.uniform(-16, 16), rng.uniform(1.4, 2.6), rng.uniform(-16, 16)],
                [rng.uniform(1.0, 1.8), rng.uniform(2.8, 5.0), rng.uniform(1.0, 1.8)],
                "#7f8993",
                [0, rng.uniform(0, 6.28), 0],
                "stone",
            )
        )

    for index in range(4):
        objects.append(
            _make_object(
                f"human-{index}",
                "human",
                [rng.uniform(-8, 8), 0.95, rng.uniform(-8, 8)],
                [0.8, 1.9, 0.8],
                "#d6b6a3",
                [0, rng.uniform(0, 6.28), 0],
                "default",
            )
        )

    return objects


def _mock_blueprint_from_prompt(prompt: str) -> dict[str, Any]:
    prompt_text = prompt.lower()
    rng = _seeded_rng(prompt)
    blueprint = _deep_copy(FALLBACK_WORLD_BLUEPRINT)

    is_city = _prompt_has_any(prompt_text, ["city", "urban", "street", "downtown", "metropolis"])
    is_forest = _prompt_has_any(prompt_text, ["forest", "jungle", "woods", "woodland"])
    is_desert = _prompt_has_any(prompt_text, ["desert", "dune", "sand"])
    is_night = _prompt_has_any(prompt_text, ["night", "midnight", "dark"])

    if is_city:
        blueprint["environmentType"] = "city"
        blueprint["lighting"]["skyColor"] = "#2e364b" if is_night else "#91b5e2"
        blueprint["lighting"]["ambientIntensity"] = 0.22 if is_night else 0.42
        blueprint["lighting"]["directionalIntensity"] = 0.55 if is_night else 1.05
        blueprint["fog"] = {"color": "#394055" if is_night else "#8aa1c8", "near": 18, "far": 85}
        blueprint["enemyCount"] = 4 if is_night else 2
        blueprint["objectList"] = _generate_city_objects(prompt_text, rng, is_night)
        return blueprint

    if is_forest:
        blueprint["environmentType"] = "forest"
        blueprint["lighting"]["skyColor"] = "#7fae87" if not is_night else "#42564a"
        blueprint["lighting"]["ambientIntensity"] = 0.25 if is_night else 0.45
        blueprint["lighting"]["directionalIntensity"] = 0.6 if is_night else 1.05
        blueprint["fog"] = {"color": "#5d7d66" if is_night else "#8dbb93", "near": 10, "far": 55}
        blueprint["enemyCount"] = 3
        blueprint["objectList"] = _generate_forest_objects(prompt_text, rng)
        return blueprint

    if is_desert:
        blueprint["environmentType"] = "desert"
        blueprint["lighting"]["skyColor"] = "#f2cf94"
        blueprint["fog"] = {"color": "#d9ba89", "near": 14, "far": 65}
        blueprint["enemyCount"] = 4
        return blueprint

    if is_night:
        blueprint["lighting"]["ambientIntensity"] = 0.22
        blueprint["lighting"]["directionalIntensity"] = 0.65
        blueprint["fog"]["near"] = 11
        blueprint["fog"]["far"] = 45

    blueprint["objectList"] = _generate_ruins_objects(rng)
    return blueprint


def _synthesize_world_from_prompt(prompt: str, blueprint: dict[str, Any]) -> dict[str, Any]:
    prompt_text = prompt.lower()
    updated = _merge_blueprint_with_fallback(blueprint)
    mock_world = _mock_blueprint_from_prompt(prompt)

    if _prompt_has_any(prompt_text, ["city", "urban", "street", "downtown", "metropolis"]):
        updated["environmentType"] = mock_world["environmentType"]
        updated["lighting"] = mock_world["lighting"]
        updated["fog"] = mock_world["fog"]
        updated["objectList"] = mock_world["objectList"]
        updated["enemyCount"] = mock_world["enemyCount"]
        return updated

    if _prompt_has_any(prompt_text, ["forest", "jungle", "woods", "woodland"]):
        updated["environmentType"] = mock_world["environmentType"]
        updated["lighting"] = mock_world["lighting"]
        updated["fog"] = mock_world["fog"]
        updated["objectList"] = mock_world["objectList"]
        updated["enemyCount"] = mock_world["enemyCount"]
        return updated

    if _prompt_has_any(prompt_text, ["desert", "dune", "sand"]):
        updated["environmentType"] = mock_world["environmentType"]
        updated["lighting"]["skyColor"] = mock_world["lighting"]["skyColor"]
        updated["fog"] = mock_world["fog"]
        return updated

    if "night" in prompt_text:
        updated["lighting"]["ambientIntensity"] = min(updated["lighting"]["ambientIntensity"], 0.25)
        updated["lighting"]["directionalIntensity"] = min(updated["lighting"]["directionalIntensity"], 0.7)
        updated["fog"]["near"] = min(updated["fog"]["near"], 12)
        updated["fog"]["far"] = min(updated["fog"]["far"], 45)

    if not updated.get("objectList"):
        updated["objectList"] = mock_world["objectList"]

    return updated


def _try_llm_blueprint(prompt: str) -> dict[str, Any] | None:
    system_prompt = (
        "You generate 3D world blueprints for a game. "
        "Respond with JSON only. No markdown and no explanations. "
        "Return exactly these top-level keys: environmentType, lighting, fog, objectList, enemyCount. "
        "objectList items must include: id, shape, position, size, rotation, materialType, color. "
        "Allowed shapes: box, sphere, cylinder, cone, tree, human, building, streetlight, car."
    )
    user_prompt = f"Create a world blueprint for this prompt: {prompt}"
    return _try_llm_json_response(system_prompt, user_prompt)


def generate_world_blueprint(prompt: str) -> dict[str, Any]:
    llm_candidate = _try_llm_blueprint(prompt)
    candidate = llm_candidate if llm_candidate else _mock_blueprint_from_prompt(prompt)
    candidate = _synthesize_world_from_prompt(prompt, candidate)
    try:
        return WorldBlueprintSchema.model_validate(candidate).model_dump()
    except Exception:
        fallback = _synthesize_world_from_prompt(prompt, _mock_blueprint_from_prompt(prompt))
        return WorldBlueprintSchema.model_validate(fallback).model_dump()


def _mock_director_directive(world_state: dict[str, Any]) -> dict[str, Any]:
    player_health = float(world_state.get("playerHealth", 100))
    enemy_count = int(world_state.get("enemyCount", 0))
    tension_level = float(world_state.get("tensionLevel", 0))

    directive = _deep_copy(FALLBACK_DIRECTOR_DIRECTIVE)

    if player_health < 45:
        directive["spawnHealth"] = True
        directive["adjustLighting"] = {"ambientIntensity": 0.5, "directionalIntensity": 1.0}
        directive["changeFog"] = {"color": "#95b6dd", "near": 18, "far": 60}
        return directive

    if tension_level < 35 and enemy_count < 6:
        directive["spawnEnemy"] = 1
        directive["adjustLighting"] = {"ambientIntensity": 0.35, "directionalIntensity": 1.3}
        directive["changeFog"] = {"color": "#7ea3d9", "near": 14, "far": 52}
        return directive

    if tension_level > 75:
        directive["spawnHealth"] = True
        directive["changeFog"] = {"color": "#9cc0e8", "near": 20, "far": 65}
        directive["adjustLighting"] = {"ambientIntensity": 0.55, "directionalIntensity": 1.0}
        return directive

    if enemy_count < 4:
        directive["spawnEnemy"] = 1

    return directive


def _try_llm_director_directive(world_state: dict[str, Any]) -> dict[str, Any] | None:
    system_prompt = (
        "You are an AI Director for a real-time 3D game. "
        "Return JSON only with exactly these keys: spawnEnemy, changeFog, adjustLighting, spawnHealth. "
        "spawnEnemy must be 0-5. changeFog must be null or an object with color, near, far. "
        "adjustLighting must be null or an object with ambientIntensity and directionalIntensity, optionally skyColor. "
        "No markdown. No explanation."
    )
    user_prompt = f"World state JSON: {json.dumps(world_state)}"
    return _try_llm_json_response(system_prompt, user_prompt)


def _is_noop_directive(directive: dict[str, Any]) -> bool:
    return (
        int(directive.get("spawnEnemy", 0)) == 0
        and not directive.get("changeFog")
        and not directive.get("adjustLighting")
        and bool(directive.get("spawnHealth")) is False
    )


def generate_director_directive(world_state: dict[str, Any]) -> dict[str, Any]:
    mock_candidate = _mock_director_directive(world_state)
    llm_raw = _try_llm_director_directive(world_state)

    try:
        if llm_raw:
            llm_candidate = DirectorDirectiveSchema.model_validate(llm_raw).model_dump()
            if not _is_noop_directive(llm_candidate) or _is_noop_directive(mock_candidate):
                return llm_candidate
        return DirectorDirectiveSchema.model_validate(mock_candidate).model_dump()
    except Exception:
        return DirectorDirectiveSchema.model_validate(mock_candidate).model_dump()
