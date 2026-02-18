import { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { DRACO_DECODER_PATH } from '../graphics/assetQuality';

const resolvedCache = new Map();
const pendingCache = new Map();
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

function loadGltf(url) {
  if (!url) return Promise.reject(new Error('Missing asset URL'));
  if (resolvedCache.has(url)) return Promise.resolve(resolvedCache.get(url));
  if (pendingCache.has(url)) return pendingCache.get(url);

  const request = new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolvedCache.set(url, gltf);
        pendingCache.delete(url);
        resolve(gltf);
      },
      undefined,
      (error) => {
        pendingCache.delete(url);
        reject(error);
      }
    );
  });

  pendingCache.set(url, request);
  return request;
}

export default function useGltfAsset(url) {
  const [state, setState] = useState(() => ({
    gltf: url && resolvedCache.has(url) ? resolvedCache.get(url) : null,
    loading: !!url && !resolvedCache.has(url),
    error: null
  }));

  useEffect(() => {
    let active = true;

    if (!url) {
      setState({ gltf: null, loading: false, error: new Error('Missing asset URL') });
      return () => {
        active = false;
      };
    }

    if (resolvedCache.has(url)) {
      setState({ gltf: resolvedCache.get(url), loading: false, error: null });
      return () => {
        active = false;
      };
    }

    setState({ gltf: null, loading: true, error: null });
    loadGltf(url)
      .then((gltf) => {
        if (!active) return;
        setState({ gltf, loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({ gltf: null, loading: false, error: error instanceof Error ? error : new Error('Asset load failed') });
      });

    return () => {
      active = false;
    };
  }, [url]);

  return state;
}
