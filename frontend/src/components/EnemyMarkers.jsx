import { RigidBody, CuboidCollider } from '@react-three/rapier';

export default function EnemyMarkers({ enemies = [] }) {
  return enemies.map((enemy) => (
    <RigidBody key={enemy.id} type="fixed" colliders={false}>
      <CuboidCollider
        args={[enemy.size[0] / 2, enemy.size[1] / 2, enemy.size[2] / 2]}
        position={enemy.position}
      />
      <group position={enemy.position}>
        <mesh castShadow>
          <icosahedronGeometry args={[enemy.size[0] * 0.52, 2]} />
          <meshStandardMaterial color="#404858" roughness={0.32} metalness={0.72} />
        </mesh>
        <mesh>
          <sphereGeometry args={[enemy.size[0] * 0.22, 18, 18]} />
          <meshStandardMaterial color={enemy.color} emissive={enemy.color} emissiveIntensity={1.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[enemy.size[0] * 0.46, enemy.size[0] * 0.07, 14, 34]} />
          <meshStandardMaterial color="#252d38" emissive="#6d1d1d" emissiveIntensity={0.5} metalness={0.6} />
        </mesh>
        <pointLight color="#cf4a4a" intensity={0.55} distance={6} decay={2} />
      </group>
    </RigidBody>
  ));
}
