import { useEffect, useRef } from 'react';
import { Sky } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Vector3 } from 'three';
import Ground from './Ground';
import EnvironmentObjects from './EnvironmentObjects';
import EnemyMarkers from './EnemyMarkers';
import ScenicBackdrop from './ScenicBackdrop';

const BACKDROP_COLOR = {
  ruins: '#6f7b8d',
  forest: '#4f6755',
  desert: '#927a5c',
  city: '#5c6779'
};

export default function WorldBlueprintRenderer({ runtime }) {
  const { scene } = useThree();
  const fogRef = useRef(null);
  const ambientLightRef = useRef(null);
  const directionalLightRef = useRef(null);

  const scalarCurrentRef = useRef({
    ambientIntensity: runtime.lighting.ambientIntensity,
    directionalIntensity: runtime.lighting.directionalIntensity,
    fogNear: runtime.fog.near,
    fogFar: runtime.fog.far
  });
  const scalarTargetRef = useRef({ ...scalarCurrentRef.current });

  const skyCurrentRef = useRef(new Color(runtime.lighting.skyColor));
  const skyTargetRef = useRef(new Color(runtime.lighting.skyColor));
  const fogCurrentRef = useRef(new Color(runtime.fog.color));
  const fogTargetRef = useRef(new Color(runtime.fog.color));
  const directionalPositionCurrentRef = useRef(new Vector3(...runtime.lighting.directionalPosition));
  const directionalPositionTargetRef = useRef(new Vector3(...runtime.lighting.directionalPosition));

  useEffect(() => {
    scene.background = skyCurrentRef.current.clone();
    return () => {
      scene.background = null;
    };
  }, [scene]);

  useEffect(() => {
    scalarTargetRef.current = {
      ambientIntensity: runtime.lighting.ambientIntensity,
      directionalIntensity: runtime.lighting.directionalIntensity,
      fogNear: runtime.fog.near,
      fogFar: runtime.fog.far
    };
    skyTargetRef.current.set(runtime.lighting.skyColor);
    fogTargetRef.current.set(runtime.fog.color);
    directionalPositionTargetRef.current.set(...runtime.lighting.directionalPosition);
  }, [runtime]);

  useFrame((_, delta) => {
    const smooth = Math.min(1, delta * 2.5);

    scalarCurrentRef.current.ambientIntensity +=
      (scalarTargetRef.current.ambientIntensity - scalarCurrentRef.current.ambientIntensity) * smooth;
    scalarCurrentRef.current.directionalIntensity +=
      (scalarTargetRef.current.directionalIntensity - scalarCurrentRef.current.directionalIntensity) * smooth;
    scalarCurrentRef.current.fogNear += (scalarTargetRef.current.fogNear - scalarCurrentRef.current.fogNear) * smooth;
    scalarCurrentRef.current.fogFar += (scalarTargetRef.current.fogFar - scalarCurrentRef.current.fogFar) * smooth;

    skyCurrentRef.current.lerp(skyTargetRef.current, smooth);
    fogCurrentRef.current.lerp(fogTargetRef.current, smooth);
    directionalPositionCurrentRef.current.lerp(directionalPositionTargetRef.current, smooth);

    if (scene.background) {
      scene.background.copy(skyCurrentRef.current);
    }
    if (fogRef.current) {
      fogRef.current.color.copy(fogCurrentRef.current);
      fogRef.current.near = scalarCurrentRef.current.fogNear;
      fogRef.current.far = scalarCurrentRef.current.fogFar;
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = scalarCurrentRef.current.ambientIntensity;
    }
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = scalarCurrentRef.current.directionalIntensity;
      directionalLightRef.current.position.copy(directionalPositionCurrentRef.current);
    }
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[runtime.fog.color, runtime.fog.near, runtime.fog.far]} />
      <ambientLight ref={ambientLightRef} intensity={runtime.lighting.ambientIntensity} />
      <hemisphereLight color="#dbe7ff" groundColor="#334155" intensity={0.28} />
      <directionalLight
        ref={directionalLightRef}
        castShadow
        intensity={runtime.lighting.directionalIntensity}
        position={runtime.lighting.directionalPosition}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0003}
      />
      <Sky
        sunPosition={runtime.lighting.sunPosition}
        turbidity={7}
        rayleigh={1.8}
        mieCoefficient={0.004}
        mieDirectionalG={0.78}
      />

      <Ground color={runtime.groundColor} environmentType={runtime.environmentType} />
      <ScenicBackdrop color={BACKDROP_COLOR[runtime.environmentType] ?? BACKDROP_COLOR.ruins} />
      <EnvironmentObjects objectList={runtime.objectList} />
      <EnemyMarkers enemies={runtime.enemyMarkers} />
    </>
  );
}
