import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AnimationMixer } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import useGltfAsset from '../hooks/useGltfAsset';
import { ASSET_QUALITY } from '../graphics/assetQuality';

function resolveAnimationClipByNames(animations, names = []) {
  if (!animations || animations.length === 0) return null;
  if (!names || names.length === 0) return animations[0];

  for (const name of names) {
    const lowerName = name.toLowerCase();
    const exact = animations.find((clip) => clip.name.toLowerCase() === lowerName);
    if (exact) return exact;
    const contains = animations.find((clip) => clip.name.toLowerCase().includes(lowerName));
    if (contains) return contains;
  }

  return animations[0];
}

export default function AssetModel({
  url,
  position,
  rotation,
  scale,
  animationProfile = null,
  animationState = 'idle',
  playbackRate = 1,
  fallback = null
}) {
  const { gltf, error } = useGltfAsset(url);
  const { gl } = useThree();
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const currentStateRef = useRef(null);
  const animationStateRef = useRef(animationState);
  const maxAnisotropyRef = useRef(1);

  useEffect(() => {
    maxAnisotropyRef.current = Math.min(
      ASSET_QUALITY.maxTextureAnisotropy,
      Math.max(1, gl.capabilities.getMaxAnisotropy?.() ?? 1)
    );
  }, [gl]);

  useEffect(() => {
    animationStateRef.current = animationState || 'idle';
  }, [animationState]);

  const scene = useMemo(() => {
    if (!gltf) return null;
    return clone(gltf.scene);
  }, [gltf]);

  useEffect(() => {
    if (!scene) return undefined;

    scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.frustumCulled = true;
        if (node.material && 'envMapIntensity' in node.material) {
          node.material.envMapIntensity = 1.2;
          if ('map' in node.material && node.material.map) {
            node.material.map.anisotropy = maxAnisotropyRef.current;
          }
          if ('normalMap' in node.material && node.material.normalMap) {
            node.material.normalMap.anisotropy = maxAnisotropyRef.current;
          }
          if ('roughnessMap' in node.material && node.material.roughnessMap) {
            node.material.roughnessMap.anisotropy = maxAnisotropyRef.current;
          }
          if ('metalnessMap' in node.material && node.material.metalnessMap) {
            node.material.metalnessMap.anisotropy = maxAnisotropyRef.current;
          }
          if ('aoMap' in node.material && node.material.aoMap) {
            node.material.aoMap.anisotropy = maxAnisotropyRef.current;
          }
          node.material.needsUpdate = true;
        }
      }
    });

    if (!gltf || !gltf.animations || gltf.animations.length === 0) {
      actionsRef.current = {};
      mixerRef.current = null;
      return undefined;
    }

    const mixer = new AnimationMixer(scene);
    mixerRef.current = mixer;

    const idleClip = resolveAnimationClipByNames(gltf.animations, animationProfile?.idle ?? []);
    const walkClip = resolveAnimationClipByNames(gltf.animations, animationProfile?.walk ?? []);
    const runClip = resolveAnimationClipByNames(gltf.animations, animationProfile?.run ?? []);

    const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
    const walkAction = walkClip ? mixer.clipAction(walkClip) : null;
    const runAction = runClip ? mixer.clipAction(runClip) : null;
    const fallbackAction = idleAction || walkAction || runAction;

    actionsRef.current = {
      idle: idleAction || fallbackAction || null,
      walk: walkAction || idleAction || fallbackAction || null,
      run: runAction || walkAction || idleAction || fallbackAction || null
    };

    const initialState = animationStateRef.current in actionsRef.current ? animationStateRef.current : 'idle';
    const initialAction = actionsRef.current[initialState] || actionsRef.current.idle;
    if (initialAction) {
      currentStateRef.current = initialState;
      initialAction.reset();
      initialAction.fadeIn(0.18);
      initialAction.play();
    }

    return () => {
      Object.values(actionsRef.current).forEach((action) => {
        if (action) {
          action.stop();
        }
      });
      actionsRef.current = {};
      currentStateRef.current = null;
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [scene, gltf, animationProfile]);

  useEffect(() => {
    const target = animationState || 'idle';
    const actions = actionsRef.current;
    if (!actions || !actions.idle) return;
    if (currentStateRef.current === target) return;

    const nextAction = actions[target] || actions.idle;
    const currentAction = actions[currentStateRef.current] || null;
    if (!nextAction) return;

    if (currentAction && currentAction !== nextAction) {
      currentAction.fadeOut(0.16);
    }

    nextAction.reset();
    nextAction.fadeIn(0.16);
    nextAction.play();
    currentStateRef.current = target;
  }, [animationState]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      Object.values(actionsRef.current).forEach((action) => {
        if (action) {
          action.timeScale = playbackRate;
        }
      });
      mixerRef.current.update(delta);
    }
  });

  if (scene) {
    return (
      <group ref={modelRef} position={position} rotation={rotation} scale={scale}>
        <primitive object={scene} />
      </group>
    );
  }

  if (error) {
    return fallback;
  }

  return fallback;
}
