import { useEffect, useRef } from 'react';
import { Sky } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Vector3 } from 'three';
import Ground from './Ground';
import EnvironmentObjects from './EnvironmentObjects';
import EnemyMarkers from './EnemyMarkers';
import ScenicBackdrop from './ScenicBackdrop';
import { DIRECTIONAL_SHADOW_CONFIG } from '../graphics/lightingSetup';
import HdriEnvironment from '../graphics/HdriEnvironment';
import ShadowEnhancement from '../graphics/ShadowEnhancement';

const BACKDROP_COLOR = {
  ruins: '#6f7b8d',
  forest: '#4f6755',
  desert: '#927a5c',
  city: '#5c6779'
};

const AMBIENT_SCALE = 0.42;
const MAX_AMBIENT_INTENSITY = 0.34;

function getAmbientIntensity(value) {
  const scaled = value * AMBIENT_SCALE;
  return Math.min(MAX_AMBIENT_INTENSITY, Math.max(0.02, scaled));
}

export default function WorldBlueprintRenderer({ runtime }) {
  const { scene } = useThree();
  const fogRef = useRef(null);
  const ambientLightRef = useRef(null);
  const directionalLightRef = useRef(null);

  const scalarCurrentRef = useRef({
    ambientIntensity: getAmbientIntensity(runtime.lighting.ambientIntensity),
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
      ambientIntensity: getAmbientIntensity(runtime.lighting.ambientIntensity),
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
      <HdriEnvironment environmentType={runtime.environmentType} intensity={1} />
      <ambientLight ref={ambientLightRef} intensity={getAmbientIntensity(runtime.lighting.ambientIntensity)} />
      <directionalLight
        ref={directionalLightRef}
        castShadow
        intensity={runtime.lighting.directionalIntensity}
        position={runtime.lighting.directionalPosition}
        shadow-mapSize-width={DIRECTIONAL_SHADOW_CONFIG.mapSize}
        shadow-mapSize-height={DIRECTIONAL_SHADOW_CONFIG.mapSize}
        shadow-camera-left={-DIRECTIONAL_SHADOW_CONFIG.cameraFrustum}
        shadow-camera-right={DIRECTIONAL_SHADOW_CONFIG.cameraFrustum}
        shadow-camera-top={DIRECTIONAL_SHADOW_CONFIG.cameraFrustum}
        shadow-camera-bottom={-DIRECTIONAL_SHADOW_CONFIG.cameraFrustum}
        shadow-camera-near={DIRECTIONAL_SHADOW_CONFIG.near}
        shadow-camera-far={DIRECTIONAL_SHADOW_CONFIG.far}
        shadow-bias={DIRECTIONAL_SHADOW_CONFIG.bias}
        shadow-normalBias={DIRECTIONAL_SHADOW_CONFIG.normalBias}
        shadow-radius={DIRECTIONAL_SHADOW_CONFIG.radius}
      />
      <Sky
        sunPosition={runtime.lighting.sunPosition}
        turbidity={7}
        rayleigh={1.8}
        mieCoefficient={0.004}
        mieDirectionalG={0.78}
      />

      <Ground color={runtime.groundColor} environmentType={runtime.environmentType} />
      <ShadowEnhancement />
      <ScenicBackdrop color={BACKDROP_COLOR[runtime.environmentType] ?? BACKDROP_COLOR.ruins} />
      <EnvironmentObjects objectList={runtime.objectList} environmentType={runtime.environmentType} />
      <EnemyMarkers enemies={runtime.enemyMarkers} />
    </>
  );
}
