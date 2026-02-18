import { useEffect, useState } from 'react';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { EquirectangularReflectionMapping, PMREMGenerator } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { HDRI_FALLBACK_PRESET, resolveHdriPath } from './lightingSetup';

export default function HdriEnvironment({ environmentType, intensity = 1 }) {
  const { gl, scene } = useThree();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hdriPath = resolveHdriPath(environmentType);
    const previousEnvironment = scene.environment;
    let active = true;
    let envRenderTarget = null;

    setFailed(false);

    const loader = new RGBELoader();
    const pmrem = new PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();

    loader.load(
      hdriPath,
      (hdrTexture) => {
        if (!active) {
          hdrTexture.dispose();
          return;
        }
        hdrTexture.mapping = EquirectangularReflectionMapping;
        envRenderTarget = pmrem.fromEquirectangular(hdrTexture);
        scene.environment = envRenderTarget.texture;
        scene.environmentIntensity = intensity;
        hdrTexture.dispose();
      },
      undefined,
      () => {
        if (!active) return;
        scene.environment = previousEnvironment;
        scene.environmentIntensity = intensity;
        setFailed(true);
      }
    );

    return () => {
      active = false;
      if (envRenderTarget) {
        envRenderTarget.dispose();
      }
      pmrem.dispose();
      scene.environment = previousEnvironment;
    };
  }, [environmentType, gl, intensity, scene]);

  if (!failed) return null;

  return <Environment preset={HDRI_FALLBACK_PRESET[environmentType] ?? HDRI_FALLBACK_PRESET.ruins} />;
}
