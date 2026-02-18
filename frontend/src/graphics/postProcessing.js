export const POST_PROCESSING_PROFILE = {
  smaa: {
    enabled: true
  },
  ssao: {
    enabled: true,
    samples: 8,
    radius: 0.12,
    intensity: 12,
    luminanceInfluence: 0.38
  },
  bloom: {
    enabled: true,
    intensity: 0.24,
    threshold: 0.78,
    smoothing: 0.22
  },
  colorGrading: {
    enabled: true,
    brightness: 0.006,
    contrast: 0.06,
    saturation: 0.03,
    hue: 0
  },
  vignette: {
    enabled: true,
    offset: 0.2,
    darkness: 0.34
  },
  dof: {
    enabled: false,
    focusDistance: 0.028,
    focalLength: 0.02,
    bokehScale: 1.8,
    height: 480
  }
};
