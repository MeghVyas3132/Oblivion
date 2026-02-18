# High-Fidelity Asset Pack Drop Zone

Place GLB/GLTF assets here for near-cinematic quality.

Expected paths used by the app:

- forest
  - `forest/tree_oak_01.glb`
  - `forest/tree_oak_02.glb`
  - `forest/tree_pine_01.glb`

- urban
  - `urban/building_midrise_01.glb`
  - `urban/building_tower_01.glb`
  - `urban/streetlight_modern_01.glb`
  - `urban/streetlight_old_01.glb`
  - `urban/city_tree_01.glb`

- vehicles
  - `vehicles/sedan_01.glb`
  - `vehicles/suv_01.glb`

- humans (Mixamo-ready)
  - `humans/civilian_idle_01.glb`
  - `humans/civilian_idle_02.glb`
  - `humans/civilian_walk_01.glb`

- ruins / desert
  - `ruins/ruins_arch_01.glb`
  - `desert/palm_01.glb`
  - `desert/building_low_01.glb`

Notes:
- Assets are optional. If a file is missing, the app uses procedural fallback meshes.
- For humanoids, include embedded armature + animation clips (`Idle`, `Walk`) for best results.
- For full state machine support, include clips for `Idle`, `Walk`, and `Run` (Mixamo naming variants are supported).
- Keep assets optimized (Draco + texture compression) for runtime FPS.
- Draco-compressed GLBs are supported directly by the loader.
