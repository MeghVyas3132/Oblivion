import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier';
import useKeyboardControls from '../hooks/useKeyboardControls';

const MOVE_SPEED = 5;
const JUMP_SPEED = 6.5;
const PLAYER_RADIUS = 0.35;
const PLAYER_HALF_HEIGHT = 0.45;
const AIR_CONTROL = 0.08;
const GROUND_CONTROL = 0.2;
const IDLE_DAMPING = 0.8;

export default function PlayerController({ playerRef }) {
  const keys = useKeyboardControls();
  const jumpLatch = useRef(false);
  const { world, rapier } = useRapier();

  useFrame(() => {
    const body = playerRef.current;
    if (!body) return;

    const directionX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const directionZ = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0);
    const length = Math.hypot(directionX, directionZ) || 1;

    const velocity = body.linvel();
    const targetX = (directionX / length) * MOVE_SPEED;
    const targetZ = (directionZ / length) * MOVE_SPEED;

    const origin = body.translation();
    const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, PLAYER_HALF_HEIGHT + PLAYER_RADIUS + 0.15, true);
    const grounded = !!hit;

    const control = grounded ? GROUND_CONTROL : AIR_CONTROL;
    let nextX = velocity.x + (targetX - velocity.x) * control;
    let nextZ = velocity.z + (targetZ - velocity.z) * control;

    if (Math.abs(directionX) < 0.001) nextX *= IDLE_DAMPING;
    if (Math.abs(directionZ) < 0.001) nextZ *= IDLE_DAMPING;

    const nextVelocity = {
      x: nextX,
      y: velocity.y,
      z: nextZ
    };

    if (keys.jump && grounded && !jumpLatch.current) {
      nextVelocity.y = JUMP_SPEED;
      jumpLatch.current = true;
    }

    if (!keys.jump) {
      jumpLatch.current = false;
    }

    body.setLinvel(nextVelocity, true);
  });

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      mass={1}
      position={[0, 2, 5]}
      friction={0.4}
      enabledRotations={[false, false, false]}
      canSleep={false}
    >
      <CapsuleCollider args={[PLAYER_HALF_HEIGHT, PLAYER_RADIUS]} />
      <group>
        <mesh castShadow>
          <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HALF_HEIGHT * 2, 14, 20]} />
          <meshStandardMaterial color="#b5b8be" roughness={0.3} metalness={0.65} />
        </mesh>
        <mesh position={[0, 0.34, PLAYER_RADIUS * 0.68]}>
          <sphereGeometry args={[0.16, 14, 14]} />
          <meshStandardMaterial color="#8fe7ff" emissive="#4ea0b8" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      </group>
    </RigidBody>
  );
}
