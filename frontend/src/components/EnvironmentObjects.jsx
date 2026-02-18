import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getSurfaceTextures } from '../utils/proceduralTextures';

const MATERIAL_THEME = {
  stone: 'stone',
  metal: 'metal',
  wood: 'wood',
  foliage: 'foliage',
  asphalt: 'asphalt',
  default: 'stone'
};

function useMaterialTextures(materialType) {
  const theme = MATERIAL_THEME[materialType] ?? 'stone';
  return useMemo(() => getSurfaceTextures(theme), [theme]);
}

function getMaterialValues(materialType) {
  if (materialType === 'metal') return { roughness: 0.34, metalness: 0.72, bumpScale: 0.06 };
  if (materialType === 'wood') return { roughness: 0.81, metalness: 0.08, bumpScale: 0.12 };
  if (materialType === 'foliage') return { roughness: 0.93, metalness: 0.02, bumpScale: 0.07 };
  if (materialType === 'asphalt') return { roughness: 0.98, metalness: 0.02, bumpScale: 0.06 };
  return { roughness: 0.88, metalness: 0.1, bumpScale: 0.14 };
}

function PBRMaterial({ color, textures, materialType }) {
  const materialValues = getMaterialValues(materialType);
  return (
    <meshStandardMaterial
      color={color}
      map={textures.colorMap}
      roughnessMap={textures.roughnessMap}
      bumpMap={textures.bumpMap}
      bumpScale={materialValues.bumpScale}
      roughness={materialValues.roughness}
      metalness={materialValues.metalness}
    />
  );
}

function PrimitiveObject({ object }) {
  const textures = useMaterialTextures(object.materialType);

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[object.size[0] / 2, object.size[1] / 2, object.size[2] / 2]}
        position={object.position}
      />
      <mesh castShadow receiveShadow position={object.position} rotation={object.rotation}>
        {object.shape === 'sphere' ? (
          <sphereGeometry args={[Math.max(object.size[0], object.size[1], object.size[2]) * 0.5, 20, 20]} />
        ) : null}
        {object.shape === 'cylinder' ? <cylinderGeometry args={[object.size[0] * 0.5, object.size[2] * 0.5, object.size[1], 24]} /> : null}
        {object.shape === 'cone' ? <coneGeometry args={[object.size[0] * 0.5, object.size[1], 22]} /> : null}
        {object.shape === 'box' ? <boxGeometry args={object.size} /> : null}
        <PBRMaterial color={object.color} textures={textures} materialType={object.materialType} />
      </mesh>
    </RigidBody>
  );
}

function TreeObject({ object }) {
  const trunkTextures = useMaterialTextures('wood');
  const foliageTextures = useMaterialTextures('foliage');
  const trunkHeight = object.size[1] * 0.45;
  const canopyHeight = object.size[1] * 0.7;

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[object.size[0] * 0.2, trunkHeight * 0.5, object.size[2] * 0.2]}
        position={[object.position[0], object.position[1] - object.size[1] * 0.25, object.position[2]]}
      />
      <group position={object.position} rotation={object.rotation}>
        <mesh castShadow receiveShadow position={[0, -object.size[1] * 0.25, 0]}>
          <cylinderGeometry args={[object.size[0] * 0.12, object.size[0] * 0.2, trunkHeight, 10]} />
          <PBRMaterial color="#6f4e35" textures={trunkTextures} materialType="wood" />
        </mesh>

        <mesh castShadow receiveShadow position={[0, trunkHeight * 0.35 - object.size[1] * 0.04, 0]}>
          <coneGeometry args={[object.size[0] * 0.66, canopyHeight * 0.7, 16]} />
          <PBRMaterial color={object.color} textures={foliageTextures} materialType="foliage" />
        </mesh>

        <mesh castShadow receiveShadow position={[0, canopyHeight * 0.55, 0]}>
          <coneGeometry args={[object.size[0] * 0.48, canopyHeight * 0.52, 14]} />
          <PBRMaterial color={object.color} textures={foliageTextures} materialType="foliage" />
        </mesh>
      </group>
    </RigidBody>
  );
}

function HumanObject({ object }) {
  const bodyRef = useRef(null);

  useFrame(({ clock }) => {
    if (!bodyRef.current) return;
    const t = clock.getElapsedTime();
    bodyRef.current.position.y = Math.sin(t * 2 + object.position[0]) * 0.02;
    bodyRef.current.rotation.y = object.rotation[1] + Math.sin(t + object.position[2]) * 0.08;
  });

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.22, 0.88, 0.22]} position={object.position} />
      <group ref={bodyRef} position={object.position}>
        <mesh castShadow position={[0, 0.62, 0]}>
          <capsuleGeometry args={[0.18, 0.7, 8, 10]} />
          <meshStandardMaterial color="#2f3747" roughness={0.74} metalness={0.12} />
        </mesh>
        <mesh castShadow position={[0, 1.23, 0]}>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshStandardMaterial color={object.color} roughness={0.7} metalness={0.06} />
        </mesh>
        <mesh castShadow position={[-0.24, 0.72, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#242b39" roughness={0.72} metalness={0.15} />
        </mesh>
        <mesh castShadow position={[0.24, 0.72, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#242b39" roughness={0.72} metalness={0.15} />
        </mesh>
      </group>
    </RigidBody>
  );
}

function BuildingObject({ object }) {
  const textures = useMaterialTextures('stone');
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
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[object.size[0] / 2, object.size[1] / 2, object.size[2] / 2]}
        position={object.position}
      />
      <group position={object.position} rotation={object.rotation}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={object.size} />
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
    </RigidBody>
  );
}

function StreetlightObject({ object }) {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.14, object.size[1] * 0.5, 0.14]} position={object.position} />
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
    </RigidBody>
  );
}

function CarObject({ object }) {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[object.size[0] * 0.48, object.size[1] * 0.42, object.size[2] * 0.48]}
        position={object.position}
      />
      <group position={object.position} rotation={object.rotation}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[object.size[0], object.size[1] * 0.65, object.size[2]]} />
          <meshStandardMaterial color={object.color} roughness={0.3} metalness={0.72} />
        </mesh>
        <mesh castShadow position={[0, object.size[1] * 0.36, -object.size[2] * 0.06]}>
          <boxGeometry args={[object.size[0] * 0.7, object.size[1] * 0.45, object.size[2] * 0.5]} />
          <meshStandardMaterial color="#445066" roughness={0.22} metalness={0.65} />
        </mesh>
        {[-1, 1].map((side) =>
          [-1, 1].map((front) => (
            <mesh key={`${side}-${front}`} castShadow position={[side * object.size[0] * 0.42, -object.size[1] * 0.3, front * object.size[2] * 0.34]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.07, 10, 18]} />
              <meshStandardMaterial color="#1c212d" roughness={0.84} metalness={0.2} />
            </mesh>
          ))
        )}
        <mesh position={[0, 0.05, object.size[2] * 0.52]}>
          <planeGeometry args={[object.size[0] * 0.6, 0.08]} />
          <meshStandardMaterial color="#f5f0d0" emissive="#b3a46a" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </RigidBody>
  );
}

function renderObject(object) {
  if (object.shape === 'tree') return <TreeObject key={object.id} object={object} />;
  if (object.shape === 'human') return <HumanObject key={object.id} object={object} />;
  if (object.shape === 'building') return <BuildingObject key={object.id} object={object} />;
  if (object.shape === 'streetlight') return <StreetlightObject key={object.id} object={object} />;
  if (object.shape === 'car') return <CarObject key={object.id} object={object} />;
  return <PrimitiveObject key={object.id} object={object} />;
}

export default function EnvironmentObjects({ objectList = [] }) {
  return objectList.map((object) => renderObject(object));
}
