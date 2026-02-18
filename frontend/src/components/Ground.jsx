import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { getSurfaceTextures } from '../utils/proceduralTextures';
import { resolveMaterialProfile, resolveMaterialTextureOptions } from '../graphics/materials';

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
  const groundTextureOptions = resolveMaterialTextureOptions(environmentType, 'high');
  const rubbleTextureOptions = resolveMaterialTextureOptions('stone', 'standard');
  const groundResolution = groundTextureOptions.resolution;
  const groundRepeatX = groundTextureOptions.repeat[0];
  const groundRepeatY = groundTextureOptions.repeat[1];
  const rubbleResolution = rubbleTextureOptions.resolution;
  const rubbleRepeatX = rubbleTextureOptions.repeat[0];
  const rubbleRepeatY = rubbleTextureOptions.repeat[1];
  const groundMaterial = resolveMaterialProfile(environmentType);
  const rubbleMaterial = resolveMaterialProfile('stone');
  const textures = useMemo(
    () =>
      getSurfaceTextures(environmentType, {
        resolution: groundResolution,
        repeat: [groundRepeatX, groundRepeatY]
      }),
    [environmentType, groundResolution, groundRepeatX, groundRepeatY]
  );
  const rubbleTextures = useMemo(
    () =>
      getSurfaceTextures('stone', {
        resolution: rubbleResolution,
        repeat: [rubbleRepeatX, rubbleRepeatY]
      }),
    [rubbleResolution, rubbleRepeatX, rubbleRepeatY]
  );

  const ensureUv2 = (geometry) => {
    if (!geometry || !geometry.attributes?.uv || geometry.attributes.uv2) return;
    geometry.setAttribute('uv2', geometry.attributes.uv);
  };

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
        <planeGeometry args={[size, size, 1, 1]} onUpdate={ensureUv2} />
        <meshStandardMaterial
          color={color}
          map={textures.colorMap}
          roughnessMap={textures.roughnessMap}
          metalnessMap={textures.metalnessMap}
          normalMap={textures.normalMap}
          aoMap={textures.aoMap}
          bumpMap={textures.bumpMap}
          bumpScale={groundMaterial.bumpScale}
          roughness={groundMaterial.roughness}
          metalness={groundMaterial.metalness}
          normalScale={[groundMaterial.normalScale, groundMaterial.normalScale]}
          aoMapIntensity={groundMaterial.aoMapIntensity}
          envMapIntensity={groundMaterial.envMapIntensity}
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
          <dodecahedronGeometry args={[1, 0]} onUpdate={ensureUv2} />
          <meshStandardMaterial
            color="#7f8997"
            map={rubbleTextures.colorMap}
            roughnessMap={rubbleTextures.roughnessMap}
            metalnessMap={rubbleTextures.metalnessMap}
            normalMap={rubbleTextures.normalMap}
            aoMap={rubbleTextures.aoMap}
            bumpMap={rubbleTextures.bumpMap}
            bumpScale={rubbleMaterial.bumpScale}
            roughness={rubbleMaterial.roughness}
            metalness={rubbleMaterial.metalness}
            normalScale={[rubbleMaterial.normalScale, rubbleMaterial.normalScale]}
            aoMapIntensity={rubbleMaterial.aoMapIntensity}
            envMapIntensity={rubbleMaterial.envMapIntensity}
          />
        </mesh>
      ))}
    </>
  );
}
