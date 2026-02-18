import { useEffect, useState } from 'react';

const KEY_MAP = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'jump'
};

const INITIAL_STATE = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false
};

export default function useKeyboardControls() {
  const [keys, setKeys] = useState(INITIAL_STATE);

  useEffect(() => {
    const updateKey = (code, isPressed) => {
      const action = KEY_MAP[code];
      if (!action) return;

      setKeys((prev) => {
        if (prev[action] === isPressed) return prev;
        return { ...prev, [action]: isPressed };
      });
    };

    const onKeyDown = (event) => updateKey(event.code, true);
    const onKeyUp = (event) => updateKey(event.code, false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return keys;
}
