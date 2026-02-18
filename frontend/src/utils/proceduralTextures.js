import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

const textureCache = new Map();

function createCanvas(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function clampColor(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function tintColor(base, amount) {
  return `rgb(${clampColor(base[0] + amount)}, ${clampColor(base[1] + amount)}, ${clampColor(base[2] + amount)})`;
}

function paintNoise(ctx, width, height, base, variance, alpha) {
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const offset = (Math.random() - 0.5) * variance;
      ctx.fillStyle = tintColor(base, offset);
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function addCracks(ctx, width, height, color, count) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < count; i += 1) {
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let j = 0; j < 5; j += 1) {
      ctx.lineTo(startX + (Math.random() - 0.5) * 120, startY + (Math.random() - 0.5) * 120);
    }
    ctx.stroke();
  }
}

function createSurfaceTextures(theme) {
  const colorCanvas = createCanvas();
  const roughCanvas = createCanvas();
  const bumpCanvas = createCanvas();

  const colorCtx = colorCanvas.getContext('2d');
  const roughCtx = roughCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  const width = colorCanvas.width;
  const height = colorCanvas.height;

  const palette = {
    ruins: [84, 95, 110],
    forest: [64, 98, 69],
    desert: [158, 132, 86],
    city: [77, 84, 93],
    stone: [104, 110, 118],
    metal: [112, 120, 131],
    wood: [118, 86, 62],
    foliage: [72, 122, 76],
    asphalt: [61, 66, 74]
  };

  const base = palette[theme] ?? palette.ruins;

  colorCtx.fillStyle = tintColor(base, -18);
  colorCtx.fillRect(0, 0, width, height);
  paintNoise(colorCtx, width, height, base, 52, 0.95);
  addCracks(colorCtx, width, height, 'rgba(32,32,32,0.7)', theme === 'desert' ? 10 : 18);

  roughCtx.fillStyle = theme === 'metal' ? '#606060' : '#9a9a9a';
  roughCtx.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const rough = clampColor((theme === 'metal' ? 90 : 140) + (Math.random() - 0.5) * 80);
      roughCtx.fillStyle = `rgb(${rough},${rough},${rough})`;
      roughCtx.fillRect(x, y, 3, 3);
    }
  }

  bumpCtx.fillStyle = '#777';
  bumpCtx.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const intensity = clampColor(120 + (Math.random() - 0.5) * 120);
      bumpCtx.fillStyle = `rgb(${intensity},${intensity},${intensity})`;
      bumpCtx.fillRect(x, y, 2, 2);
    }
  }

  const colorMap = new CanvasTexture(colorCanvas);
  const roughnessMap = new CanvasTexture(roughCanvas);
  const bumpMap = new CanvasTexture(bumpCanvas);

  [colorMap, roughnessMap, bumpMap].forEach((texture) => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(10, 10);
  });
  colorMap.colorSpace = SRGBColorSpace;

  return { colorMap, roughnessMap, bumpMap };
}

export function getSurfaceTextures(theme) {
  const key = theme || 'ruins';
  if (!textureCache.has(key)) {
    textureCache.set(key, createSurfaceTextures(key));
  }
  return textureCache.get(key);
}
