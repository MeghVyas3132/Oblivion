import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

function buildDustParticles(count, radius) {
  const particles = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const i3 = index * 3;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    particles[i3] = Math.cos(angle) * distance;
    particles[i3 + 1] = 0.5 + Math.random() * 6;
    particles[i3 + 2] = Math.sin(angle) * distance;
  }
  return particles;
}

function buildBackdropColumns(count, radius) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.2;
    const distance = radius + Math.random() * 8;
    return {
      id: `backdrop-${index}`,
      position: [Math.cos(angle) * distance, 4 + Math.random() * 6, Math.sin(angle) * distance],
      scale: [3 + Math.random() * 4, 8 + Math.random() * 10, 3 + Math.random() * 4],
      rotation: [0, Math.random() * Math.PI, 0]
    };
  });
}

export default function ScenicBackdrop({ radius = 24, color = '#7a8695' }) {
  const dustRef = useRef(null);
  const dustPositions = useMemo(() => buildDustParticles(900, radius + 4), [radius]);
  const columns = useMemo(() => buildBackdropColumns(22, radius), [radius]);

  useFrame((_, delta) => {
    if (!dustRef.current) return;
    dustRef.current.rotation.y += delta * 0.015;
  });

  return (
    <>
      {columns.map((column) => (
        <mesh
          key={column.id}
          castShadow
          receiveShadow
          position={column.position}
          rotation={column.rotation}
          scale={column.scale}
        >
          <cylinderGeometry args={[0.7, 1, 1, 7]} />
          <meshStandardMaterial color={color} roughness={0.86} metalness={0.08} />
        </mesh>
      ))}

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustPositions.length / 3}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#c8d3e4"
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.38}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  );
}
