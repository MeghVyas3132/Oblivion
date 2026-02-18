import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

const textureCache = new Map();

const THEME_PROPERTIES = {
  ruins: { base: [84, 95, 110], roughness: 0.82, metalness: 0.08, grain: 0.24 },
  forest: { base: [64, 98, 69], roughness: 0.88, metalness: 0.03, grain: 0.22 },
  desert: { base: [158, 132, 86], roughness: 0.86, metalness: 0.04, grain: 0.16 },
  city: { base: [77, 84, 93], roughness: 0.8, metalness: 0.14, grain: 0.28 },
  stone: { base: [104, 110, 118], roughness: 0.86, metalness: 0.1, grain: 0.31 },
  metal: { base: [112, 120, 131], roughness: 0.36, metalness: 0.76, grain: 0.15 },
  wood: { base: [118, 86, 62], roughness: 0.78, metalness: 0.06, grain: 0.25 },
  foliage: { base: [72, 122, 76], roughness: 0.93, metalness: 0.02, grain: 0.12 },
  asphalt: { base: [61, 66, 74], roughness: 0.95, metalness: 0.03, grain: 0.2 }
};

function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function seededRandom(seedText) {
  let state = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    state = ((state << 5) - state + seedText.charCodeAt(i)) | 0;
  }
  return () => {
    state = (state * 1664525 + 1013904223) | 0;
    return ((state >>> 0) % 100000) / 100000;
  };
}

function createHeightData({ size, rng, grain }) {
  const height = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const macro = Math.sin(x * 0.015) * 20 + Math.cos(y * 0.018) * 18;
      const micro = (rng() - 0.5) * 255 * grain;
      height[index] = clampByte(128 + macro + micro);
    }
  }

  const crackCount = Math.max(10, Math.floor(size / 56));
  for (let crack = 0; crack < crackCount; crack += 1) {
    let x = Math.floor(rng() * size);
    let y = Math.floor(rng() * size);
    const length = Math.floor(size * (0.16 + rng() * 0.22));
    const heading = rng() * Math.PI * 2;
    for (let step = 0; step < length; step += 1) {
      const ix = y * size + x;
      if (ix >= 0 && ix < height.length) {
        height[ix] = clampByte(height[ix] - (20 + rng() * 48));
      }
      x += Math.round(Math.cos(heading + (rng() - 0.5) * 0.2));
      y += Math.round(Math.sin(heading + (rng() - 0.5) * 0.2));
      if (x < 1 || x >= size - 1 || y < 1 || y >= size - 1) break;
    }
  }

  return height;
}

function createMapCanvas(size, writePixel) {
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const target = (y * size + x) * 4;
      writePixel(image.data, target, x, y);
    }
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function buildColorCanvas(size, base, heightData, rng) {
  return createMapCanvas(size, (data, target, x, y) => {
    const index = y * size + x;
    const h = heightData[index];
    const noise = (rng() - 0.5) * 22;
    data[target + 0] = clampByte(base[0] + (h - 128) * 0.24 + noise);
    data[target + 1] = clampByte(base[1] + (h - 128) * 0.26 + noise * 0.85);
    data[target + 2] = clampByte(base[2] + (h - 128) * 0.22 + noise * 0.75);
    data[target + 3] = 255;
  });
}

function buildRoughnessCanvas(size, heightData, baseRoughness, rng) {
  return createMapCanvas(size, (data, target, x, y) => {
    const index = y * size + x;
    const h = heightData[index];
    const variation = (rng() - 0.5) * 0.18;
    const value = clampByte((baseRoughness + variation + (128 - h) / 750) * 255);
    data[target + 0] = value;
    data[target + 1] = value;
    data[target + 2] = value;
    data[target + 3] = 255;
  });
}

function buildMetalnessCanvas(size, baseMetalness, rng) {
  return createMapCanvas(size, (data, target) => {
    const variation = (rng() - 0.5) * 0.08;
    const value = clampByte((baseMetalness + variation) * 255);
    data[target + 0] = value;
    data[target + 1] = value;
    data[target + 2] = value;
    data[target + 3] = 255;
  });
}

function buildAoCanvas(size, heightData) {
  return createMapCanvas(size, (data, target, x, y) => {
    const index = y * size + x;
    const h = heightData[index];
    const value = clampByte(132 + (h - 128) * 1.18);
    data[target + 0] = value;
    data[target + 1] = value;
    data[target + 2] = value;
    data[target + 3] = 255;
  });
}

function buildNormalCanvas(size, heightData) {
  return createMapCanvas(size, (data, target, x, y) => {
    const getHeight = (sx, sy) => {
      const cx = Math.max(0, Math.min(size - 1, sx));
      const cy = Math.max(0, Math.min(size - 1, sy));
      return heightData[cy * size + cx] / 255;
    };

    const left = getHeight(x - 1, y);
    const right = getHeight(x + 1, y);
    const up = getHeight(x, y - 1);
    const down = getHeight(x, y + 1);

    let nx = left - right;
    let ny = up - down;
    let nz = 1;
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= length;
    ny /= length;
    nz /= length;

    data[target + 0] = clampByte((nx + 1) * 127.5);
    data[target + 1] = clampByte((ny + 1) * 127.5);
    data[target + 2] = clampByte((nz + 1) * 127.5);
    data[target + 3] = 255;
  });
}

function toTexture(canvas, repeat, colorSpace = null) {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  if (colorSpace) texture.colorSpace = colorSpace;
  return texture;
}

function createSurfaceTextures(theme, options) {
  const settings = THEME_PROPERTIES[theme] ?? THEME_PROPERTIES.ruins;
  const resolution = options?.resolution ?? 1024;
  const repeat = options?.repeat ?? [10, 10];
  const rng = seededRandom(`${theme}-${resolution}`);
  const heightData = createHeightData({ size: resolution, rng, grain: settings.grain });

  const colorCanvas = buildColorCanvas(resolution, settings.base, heightData, rng);
  const roughnessCanvas = buildRoughnessCanvas(resolution, heightData, settings.roughness, rng);
  const metalnessCanvas = buildMetalnessCanvas(resolution, settings.metalness, rng);
  const aoCanvas = buildAoCanvas(resolution, heightData);
  const normalCanvas = buildNormalCanvas(resolution, heightData);
  const heightCanvas = createMapCanvas(resolution, (data, target, x, y) => {
    const index = y * resolution + x;
    const value = heightData[index];
    data[target + 0] = value;
    data[target + 1] = value;
    data[target + 2] = value;
    data[target + 3] = 255;
  });

  return {
    colorMap: toTexture(colorCanvas, repeat, SRGBColorSpace),
    roughnessMap: toTexture(roughnessCanvas, repeat),
    metalnessMap: toTexture(metalnessCanvas, repeat),
    aoMap: toTexture(aoCanvas, repeat),
    normalMap: toTexture(normalCanvas, repeat),
    bumpMap: toTexture(heightCanvas, repeat)
  };
}

export function getSurfaceTextures(theme, options = {}) {
  const keyTheme = theme || 'ruins';
  const resolution = options.resolution ?? 1024;
  const repeatX = options.repeat?.[0] ?? 10;
  const repeatY = options.repeat?.[1] ?? 10;
  const cacheKey = `${keyTheme}:${resolution}:${repeatX}:${repeatY}`;

  if (!textureCache.has(cacheKey)) {
    textureCache.set(
      cacheKey,
      createSurfaceTextures(keyTheme, {
        resolution,
        repeat: [repeatX, repeatY]
      })
    );
  }
  return textureCache.get(cacheKey);
}
