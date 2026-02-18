import { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import PhysicsWorld from '../physics/PhysicsWorld';
import PlayerController from '../physics/PlayerController';
import CameraFollowSystem from '../systems/CameraFollowSystem';
import { buildWorldRuntime } from '../systems/worldBlueprintBuilder';
import WorldBlueprintRenderer from './WorldBlueprintRenderer';

function SceneContent({ blueprint }) {
  const playerRef = useRef(null);
  const worldRuntime = useMemo(() => buildWorldRuntime(blueprint), [blueprint]);

  return (
    <PhysicsWorld>
      <WorldBlueprintRenderer runtime={worldRuntime} />
      <PlayerController playerRef={playerRef} />
      <CameraFollowSystem playerRef={playerRef} />
    </PhysicsWorld>
  );
}

export default function WorldScene({ blueprint }) {
  return (
    <div className="canvas-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 62, near: 0.1, far: 220, position: [0, 6, 10] }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <SceneContent blueprint={blueprint} />
      </Canvas>
    </div>
  );
}
