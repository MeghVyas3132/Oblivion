import {
  Bloom,
  BrightnessContrast,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  SMAA,
  SSAO,
  Vignette
} from '@react-three/postprocessing';
import { POST_PROCESSING_PROFILE } from '../graphics/postProcessing';

export default function CinematicPostFX() {
  const { smaa, ssao, bloom, colorGrading, vignette, dof } = POST_PROCESSING_PROFILE;

  return (
    <EffectComposer multisampling={0}>
      {smaa.enabled ? <SMAA /> : null}
      {ssao.enabled ? (
        <SSAO
          samples={ssao.samples}
          radius={ssao.radius}
          intensity={ssao.intensity}
          luminanceInfluence={ssao.luminanceInfluence}
          color="black"
        />
      ) : null}
      {bloom.enabled ? (
        <Bloom
          intensity={bloom.intensity}
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={bloom.smoothing}
          mipmapBlur
        />
      ) : null}
      {colorGrading.enabled ? (
        <>
          <BrightnessContrast brightness={colorGrading.brightness} contrast={colorGrading.contrast} />
          <HueSaturation hue={colorGrading.hue} saturation={colorGrading.saturation} />
        </>
      ) : null}
      {vignette.enabled ? <Vignette eskil={false} offset={vignette.offset} darkness={vignette.darkness} /> : null}
      {dof.enabled ? (
        <DepthOfField
          focusDistance={dof.focusDistance}
          focalLength={dof.focalLength}
          bokehScale={dof.bokehScale}
          height={dof.height}
        />
      ) : null}
    </EffectComposer>
  );
}
