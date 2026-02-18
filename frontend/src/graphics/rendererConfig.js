import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three';

export const CANVAS_DPR = [1, 2];

export const CANVAS_GL_CONFIG = {
  antialias: true,
  powerPreference: 'high-performance'
};

export const CANVAS_SHADOWS = {
  type: PCFSoftShadowMap
};

export const RENDERER_EXPOSURE = 1.03;

export function applyRendererConfig(gl) {
  gl.outputColorSpace = SRGBColorSpace;
  gl.toneMapping = ACESFilmicToneMapping;
  gl.toneMappingExposure = RENDERER_EXPOSURE;
  gl.physicallyCorrectLights = true;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = PCFSoftShadowMap;
}
