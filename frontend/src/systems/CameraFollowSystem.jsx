import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const CAMERA_OFFSET = new Vector3(0, 4, 7);
const lookAtTarget = new Vector3();
const desiredPosition = new Vector3();

export default function CameraFollowSystem({ playerRef }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!playerRef.current) return;

    const playerPosition = playerRef.current.translation();
    desiredPosition.set(playerPosition.x, playerPosition.y, playerPosition.z).add(CAMERA_OFFSET);
    camera.position.lerp(desiredPosition, 0.08);

    lookAtTarget.set(playerPosition.x, playerPosition.y + 1, playerPosition.z);
    camera.lookAt(lookAtTarget);
  });

  return null;
}
