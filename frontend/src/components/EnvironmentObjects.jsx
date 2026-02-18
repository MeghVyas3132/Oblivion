import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import AssetModel from './AssetModel';
import { getSurfaceTextures } from '../utils/proceduralTextures';
import { getAssetPath, getAssetScale, getAnimationProfile } from '../utils/assetRegistry';
import {
  resolveMaterialProfile,
  resolveMaterialTextureOptions,
  resolveMaterialTheme
} from '../graphics/materials';
import { ASSET_QUALITY, resolveLodDistance } from '../graphics/assetQuality';

function useMaterialTextures(materialType, detailLevel = 'standard') {
  const theme = resolveMaterialTheme(materialType);
  const textureOptions = resolveMaterialTextureOptions(materialType, detailLevel);
  const repeatX = textureOptions.repeat[0];
  const repeatY = textureOptions.repeat[1];
  const resolution = textureOptions.resolution;

  return useMemo(
    () =>
      getSurfaceTextures(theme, {
        resolution,
        repeat: [repeatX, repeatY]
      }),
    [theme, repeatX, repeatY, resolution]
  );
}

function ensureUv2(geometry) {
  if (!geometry || !geometry.attributes?.uv || geometry.attributes.uv2) return;
  geometry.setAttribute('uv2', geometry.attributes.uv);
}

function PBRMaterial({ color, textures, materialType }) {
  const materialValues = resolveMaterialProfile(materialType);
  return (
    <meshStandardMaterial
      color={color}
      map={textures.colorMap}
      roughnessMap={textures.roughnessMap}
      metalnessMap={textures.metalnessMap}
      normalMap={textures.normalMap}
      aoMap={textures.aoMap}
      bumpMap={textures.bumpMap}
      bumpScale={materialValues.bumpScale}
      roughness={materialValues.roughness}
      metalness={materialValues.metalness}
      normalScale={[materialValues.normalScale, materialValues.normalScale]}
      aoMapIntensity={materialValues.aoMapIntensity}
      envMapIntensity={materialValues.envMapIntensity}
    />
  );
}

function PrimitiveObject({ object }) {
  const textures = useMaterialTextures(object.materialType);

  return (
    <mesh castShadow receiveShadow position={object.position} rotation={object.rotation}>
      {object.shape === 'sphere' ? (
        <sphereGeometry
          args={[Math.max(object.size[0], object.size[1], object.size[2]) * 0.5, 20, 20]}
          onUpdate={ensureUv2}
        />
      ) : null}
      {object.shape === 'cylinder' ? (
        <cylinderGeometry args={[object.size[0] * 0.5, object.size[2] * 0.5, object.size[1], 24]} onUpdate={ensureUv2} />
      ) : null}
      {object.shape === 'cone' ? <coneGeometry args={[object.size[0] * 0.5, object.size[1], 22]} onUpdate={ensureUv2} /> : null}
      {object.shape === 'box' ? <boxGeometry args={object.size} onUpdate={ensureUv2} /> : null}
      <PBRMaterial color={object.color} textures={textures} materialType={object.materialType} />
    </mesh>
  );
}

function TreeFallback({ object }) {
  const trunkTextures = useMaterialTextures('wood');
  const foliageTextures = useMaterialTextures('foliage');
  const trunkHeight = object.size[1] * 0.45;
  const canopyHeight = object.size[1] * 0.7;

  return (
    <group position={object.position} rotation={object.rotation}>
      <mesh castShadow receiveShadow position={[0, -object.size[1] * 0.25, 0]}>
        <cylinderGeometry args={[object.size[0] * 0.12, object.size[0] * 0.2, trunkHeight, 10]} onUpdate={ensureUv2} />
        <PBRMaterial color="#6f4e35" textures={trunkTextures} materialType="wood" />
      </mesh>

      <mesh castShadow receiveShadow position={[0, trunkHeight * 0.35 - object.size[1] * 0.04, 0]}>
        <coneGeometry args={[object.size[0] * 0.66, canopyHeight * 0.7, 16]} onUpdate={ensureUv2} />
        <PBRMaterial color={object.color} textures={foliageTextures} materialType="foliage" />
      </mesh>

      <mesh castShadow receiveShadow position={[0, canopyHeight * 0.55, 0]}>
        <coneGeometry args={[object.size[0] * 0.48, canopyHeight * 0.52, 14]} onUpdate={ensureUv2} />
        <PBRMaterial color={object.color} textures={foliageTextures} materialType="foliage" />
      </mesh>
    </group>
  );
}

function HumanFallback({ object, animationState }) {
  const bodyRef = useRef(null);

  useFrame(({ clock }) => {
    if (!bodyRef.current) return;
    const t = clock.getElapsedTime();
    const stride = animationState === 'run' ? 0.06 : animationState === 'walk' ? 0.03 : 0.01;
    bodyRef.current.position.y = Math.sin(t * 4 + object.position[0]) * stride;
    bodyRef.current.rotation.y = object.rotation[1] + Math.sin(t + object.position[2]) * 0.05;
  });

  return (
    <group ref={bodyRef} position={object.position}>
      <mesh castShadow position={[0, 0.62, 0]}>
        <capsuleGeometry args={[0.18, 0.7, 8, 10]} />
        <meshStandardMaterial color="#2f3747" roughness={0.74} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 1.23, 0]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color={object.color} roughness={0.7} metalness={0.06} />
      </mesh>
    </group>
  );
}

function BuildingFallback({ object }) {
  const textures = useMaterialTextures('stone', 'standard');
  const windowCols = Math.max(2, Math.min(6, Math.floor(object.size[0] * 1.2)));
  const windowRows = Math.max(3, Math.min(14, Math.floor(object.size[1] / 1.6)));

  const windows = useMemo(() => {
    const list = [];
    for (let row = 0; row < windowRows; row += 1) {
      for (let col = 0; col < windowCols; col += 1) {
        const px = -object.size[0] * 0.36 + (col / Math.max(1, windowCols - 1)) * object.size[0] * 0.72;
        const py = -object.size[1] * 0.38 + (row / Math.max(1, windowRows - 1)) * object.size[1] * 0.76;
        list.push({ id: `${row}-${col}`, x: px, y: py, lit: (row + col) % 3 !== 0 });
      }
    }
    return list;
  }, [object.size, windowCols, windowRows]);

  return (
    <group position={object.position} rotation={object.rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={object.size} onUpdate={ensureUv2} />
        <PBRMaterial color={object.color} textures={textures} materialType="stone" />
      </mesh>

      {windows.map((window) => (
        <mesh key={window.id} position={[window.x, window.y, object.size[2] * 0.5 + 0.01]}>
          <planeGeometry args={[0.26, 0.34]} />
          <meshStandardMaterial
            color={window.lit ? '#8da2c4' : '#2d3340'}
            emissive={window.lit ? '#5f7192' : '#000000'}
            emissiveIntensity={window.lit ? 0.55 : 0}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function StreetlightFallback({ object }) {
  return (
    <group position={object.position} rotation={object.rotation}>
      <mesh castShadow position={[0, -object.size[1] * 0.12, 0]}>
        <cylinderGeometry args={[0.07, 0.1, object.size[1], 10]} />
        <meshStandardMaterial color="#8f98a6" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0.28, object.size[1] * 0.38, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#8f98a6" roughness={0.48} metalness={0.74} />
      </mesh>
      <mesh position={[0.5, object.size[1] * 0.34, 0]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial color="#f4dda8" emissive="#cba95a" emissiveIntensity={1.3} />
      </mesh>
      <pointLight color="#f5d58f" intensity={1.4} distance={9} decay={2} position={[0.5, object.size[1] * 0.34, 0]} />
    </group>
  );
}

function CarFallback({ object }) {
  return (
    <group position={object.position} rotation={object.rotation}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[object.size[0], object.size[1] * 0.65, object.size[2]]} />
        <meshStandardMaterial color={object.color} roughness={0.3} metalness={0.72} />
      </mesh>
      <mesh castShadow position={[0, object.size[1] * 0.36, -object.size[2] * 0.06]}>
        <boxGeometry args={[object.size[0] * 0.7, object.size[1] * 0.45, object.size[2] * 0.5]} />
        <meshStandardMaterial color="#445066" roughness={0.22} metalness={0.65} />
      </mesh>
    </group>
  );
}

function semanticFallback(shape, object, animationState = 'idle') {
  if (shape === 'tree') return <TreeFallback object={object} />;
  if (shape === 'human') return <HumanFallback object={object} animationState={animationState} />;
  if (shape === 'building') return <BuildingFallback object={object} />;
  if (shape === 'streetlight') return <StreetlightFallback object={object} />;
  if (shape === 'car') return <CarFallback object={object} />;
  return <PrimitiveObject object={object} />;
}

function useLodProxy(position, shape) {
  const { camera } = useThree();
  const [useProxy, setUseProxy] = useState(false);
  const timerRef = useRef(0);
  const threshold = resolveLodDistance(shape);
  const thresholdSq = threshold * threshold;

  useFrame((_, delta) => {
    if (!ASSET_QUALITY.lodEnabled) {
      if (useProxy) setUseProxy(false);
      return;
    }

    timerRef.current += delta;
    if (timerRef.current < ASSET_QUALITY.lodCheckIntervalSeconds) return;
    timerRef.current = 0;

    const dx = camera.position.x - position[0];
    const dy = camera.position.y - position[1];
    const dz = camera.position.z - position[2];
    const distanceSq = dx * dx + dy * dy + dz * dz;
    const targetUseProxy = distanceSq > thresholdSq;

    setUseProxy((current) => (current === targetUseProxy ? current : targetUseProxy));
  });

  return useProxy;
}

function StaticSemanticObject({ object, environmentType, index }) {
  const assetUrl = getAssetPath({ environmentType, shape: object.shape, index });
  const assetScale = getAssetScale({ shape: object.shape, size: object.size, url: assetUrl });
  const useProxy = useLodProxy(object.position, object.shape);

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[object.size[0] / 2, object.size[1] / 2, object.size[2] / 2]} position={object.position} />
      {useProxy ? (
        semanticFallback(object.shape, object)
      ) : (
        <AssetModel
          url={assetUrl}
          position={object.position}
          rotation={object.rotation}
          scale={assetScale}
          fallback={semanticFallback(object.shape, object)}
        />
      )}
    </RigidBody>
  );
}

function HumanSemanticObject({ object, environmentType, index }) {
  const assetUrl = getAssetPath({ environmentType, shape: object.shape, index });
  const assetScale = getAssetScale({ shape: object.shape, size: object.size, url: assetUrl });
  const animationProfile = getAnimationProfile('human');
  const wrapperRef = useRef(null);
  const useProxy = useLodProxy(object.position, 'human');

  const motionProfile = useMemo(() => {
    const modeIndex = index % 7;
    if (modeIndex === 0) return { mode: 'run', speed: 1.25, radius: 1.15 };
    if (modeIndex <= 3) return { mode: 'walk', speed: 0.6, radius: 0.72 };
    return { mode: 'idle', speed: 0, radius: 0 };
  }, [index]);

  useFrame(({ clock }) => {
    if (!wrapperRef.current) return;

    if (motionProfile.mode === 'idle') {
      wrapperRef.current.position.set(object.position[0], object.position[1], object.position[2]);
      wrapperRef.current.rotation.set(object.rotation[0], object.rotation[1], object.rotation[2]);
      return;
    }

    const t = clock.getElapsedTime() * motionProfile.speed + index * 0.9;
    const x = object.position[0] + Math.cos(t) * motionProfile.radius;
    const z = object.position[2] + Math.sin(t) * motionProfile.radius;

    wrapperRef.current.position.set(x, object.position[1], z);
    wrapperRef.current.rotation.set(object.rotation[0], object.rotation[1] + t + Math.PI * 0.5, object.rotation[2]);
  });

  const playbackRate = motionProfile.mode === 'run' ? 1.2 : motionProfile.mode === 'walk' ? 1.0 : 0.95;

  return (
    <group ref={wrapperRef} position={object.position}>
      {useProxy ? (
        semanticFallback('human', { ...object, position: [0, 0, 0], rotation: [0, 0, 0] }, motionProfile.mode)
      ) : (
        <AssetModel
          url={assetUrl}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={assetScale}
          animationProfile={animationProfile}
          animationState={motionProfile.mode}
          playbackRate={playbackRate}
          fallback={semanticFallback('human', { ...object, position: [0, 0, 0], rotation: [0, 0, 0] }, motionProfile.mode)}
        />
      )}
    </group>
  );
}

function renderObject(object, environmentType, index) {
  if (object.shape === 'human') {
    return <HumanSemanticObject key={object.id} object={object} environmentType={environmentType} index={index} />;
  }

  const staticSemanticShapes = new Set(['tree', 'building', 'streetlight', 'car']);
  if (staticSemanticShapes.has(object.shape)) {
    return <StaticSemanticObject key={object.id} object={object} environmentType={environmentType} index={index} />;
  }

  return (
    <RigidBody key={object.id} type="fixed" colliders={false}>
      <CuboidCollider args={[object.size[0] / 2, object.size[1] / 2, object.size[2] / 2]} position={object.position} />
      <PrimitiveObject object={object} />
    </RigidBody>
  );
}

export default function EnvironmentObjects({ objectList = [], environmentType = 'ruins' }) {
  return objectList.map((object, index) => renderObject(object, environmentType, index));
}
