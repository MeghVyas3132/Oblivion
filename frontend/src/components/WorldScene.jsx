import { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import PhysicsWorld from '../physics/PhysicsWorld';
import PlayerController from '../physics/PlayerController';
import CameraFollowSystem from '../systems/CameraFollowSystem';
import { buildWorldRuntime } from '../systems/worldBlueprintBuilder';
import WorldBlueprintRenderer from './WorldBlueprintRenderer';
import CinematicPostFX from './CinematicPostFX';
import { applyRendererConfig, CANVAS_DPR, CANVAS_GL_CONFIG, CANVAS_SHADOWS } from '../graphics/rendererConfig';

function SceneContent({ blueprint }) {
  const playerRef = useRef(null);
  const worldRuntime = useMemo(() => buildWorldRuntime(blueprint), [blueprint]);

  return (
    <>
      <PhysicsWorld>
        <WorldBlueprintRenderer runtime={worldRuntime} />
        <PlayerController playerRef={playerRef} />
        <CameraFollowSystem playerRef={playerRef} />
      </PhysicsWorld>
      <CinematicPostFX />
    </>
  );
}

export default function WorldScene({ blueprint }) {
  return (
    <div className="canvas-wrap">
      <Canvas
        shadows={CANVAS_SHADOWS}
        dpr={CANVAS_DPR}
        gl={CANVAS_GL_CONFIG}
        camera={{ fov: 62, near: 0.1, far: 220, position: [0, 6, 10] }}
        onCreated={({ gl }) => {
          applyRendererConfig(gl);
        }}
      >
        <SceneContent blueprint={blueprint} />
      </Canvas>
    </div>
  );
}
