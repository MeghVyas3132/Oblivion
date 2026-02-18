import { Physics } from '@react-three/rapier';

export default function PhysicsWorld({ children }) {
  return <Physics gravity={[0, -9.81, 0]}>{children}</Physics>;
}
