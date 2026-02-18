import { ContactShadows, SoftShadows } from '@react-three/drei';
import { CONTACT_SHADOW_CONFIG, SOFT_SHADOW_CONFIG } from './lightingSetup';

export default function ShadowEnhancement() {
  return (
    <>
      <SoftShadows size={SOFT_SHADOW_CONFIG.size} samples={SOFT_SHADOW_CONFIG.samples} focus={SOFT_SHADOW_CONFIG.focus} />
      <ContactShadows
        position={[0, CONTACT_SHADOW_CONFIG.positionY, 0]}
        opacity={CONTACT_SHADOW_CONFIG.opacity}
        width={CONTACT_SHADOW_CONFIG.width}
        height={CONTACT_SHADOW_CONFIG.height}
        blur={CONTACT_SHADOW_CONFIG.blur}
        far={CONTACT_SHADOW_CONFIG.far}
        resolution={CONTACT_SHADOW_CONFIG.resolution}
        color={CONTACT_SHADOW_CONFIG.color}
        frames={CONTACT_SHADOW_CONFIG.frames}
      />
    </>
  );
}
