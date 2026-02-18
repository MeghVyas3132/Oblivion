import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getSurfaceTextures } from '../utils/proceduralTextures';

const DEFAULT_GROUND_SIZE = 40;

function createRubble(size) {
  const rubble = [];
  for (let index = 0; index < 85; index += 1) {
    const angle = (index / 85) * Math.PI * 2 + Math.random() * 0.3;
    const radius = 7 + Math.random() * (size * 0.45);
    rubble.push({
      id: `rubble-${index}`,
      position: [Math.cos(angle) * radius, 0.18 + Math.random() * 0.28, Math.sin(angle) * radius],
      scale: 0.18 + Math.random() * 0.42,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
    });
  }
  return rubble;
}

export default function Ground({ color = '#324458', size = DEFAULT_GROUND_SIZE, environmentType = 'ruins' }) {
  const thickness = 0.3;
  const rubble = useMemo(() => createRubble(size), [size]);
  const textures = useMemo(() => getSurfaceTextures(environmentType), [environmentType]);
  const rubbleTextures = useMemo(() => getSurfaceTextures('stone'), []);

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[size / 2, thickness / 2, size / 2]} position={[0, -thickness / 2, 0]} />
        <mesh receiveShadow position={[0, -thickness / 2, 0]}>
          <boxGeometry args={[size, thickness, size]} />
          <meshStandardMaterial color="#1e2735" roughness={1} metalness={0.03} />
        </mesh>
      </RigidBody>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[size, size, 1, 1]} />
        <meshStandardMaterial
          color={color}
          map={textures.colorMap}
          roughnessMap={textures.roughnessMap}
          bumpMap={textures.bumpMap}
          bumpScale={0.2}
          roughness={0.96}
          metalness={0.05}
        />
      </mesh>

      {environmentType === 'city' ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[size * 0.22, size, 1, 1]} />
            <meshStandardMaterial color="#454b56" roughness={0.96} metalness={0.02} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, 0]}>
            <planeGeometry args={[size, size * 0.22, 1, 1]} />
            <meshStandardMaterial color="#454b56" roughness={0.96} metalness={0.02} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <planeGeometry args={[0.35, size, 1, 1]} />
            <meshStandardMaterial color="#c7b45a" emissive="#54481d" emissiveIntensity={0.18} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <planeGeometry args={[size, 0.35, 1, 1]} />
            <meshStandardMaterial color="#c7b45a" emissive="#54481d" emissiveIntensity={0.18} />
          </mesh>
        </>
      ) : null}

      {rubble.map((rock) => (
        <mesh
          key={rock.id}
          castShadow
          receiveShadow
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#7f8997"
            map={rubbleTextures.colorMap}
            roughnessMap={rubbleTextures.roughnessMap}
            bumpMap={rubbleTextures.bumpMap}
            bumpScale={0.14}
            roughness={0.92}
            metalness={0.06}
          />
        </mesh>
      ))}
    </>
  );
}
