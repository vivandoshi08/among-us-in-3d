import { useState, useEffect } from 'react';

type Movement = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  camera_toggle: boolean;
  jump: boolean;
  sprint: boolean;
  debug: boolean;
  kill: boolean;
};

const keys: { [key: string]: keyof Movement } = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  KeyP: 'camera_toggle',
  Space: 'jump',
  ShiftLeft: 'sprint',
  Backquote: 'debug',
  KeyK: 'kill',
};

const initialMovement: Movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  camera_toggle: false,
  jump: false,
  sprint: false,
  debug: false,
  kill: false,
};

export const usePlayerControls = () => {
  const get_movement_field = (key: string): keyof Movement => keys[key];
  const [movement, setMovement] = useState<Movement>(initialMovement);

  useEffect(() => {
    const process_key_down = (e: KeyboardEvent) => {
      if (document.pointerLockElement !== null) {
        const field = get_movement_field(e.code);
        setMovement((m) => ({
          ...m,
          [field]: field === 'camera_toggle' ? !m.camera_toggle : true,
        }));
      }
    };

    const process_key_up = (e: KeyboardEvent) => {
      if (document.pointerLockElement !== null) {
        const field = get_movement_field(e.code);
        if (field !== 'camera_toggle') {
          setMovement((m) => ({
            ...m,
            [field]: false,
          }));
        }
      }
    };

    const handle_pointer_lock_change = () => {
      const isLocked = document.pointerLockElement !== null;
      if (!isLocked) {
        setMovement((m) => ({
          ...initialMovement,
          camera_toggle: m.camera_toggle,
        }));
      }
    };

    document.addEventListener('keydown', process_key_down);
    document.addEventListener('keyup', process_key_up);
    document.addEventListener('pointerlockchange', handle_pointer_lock_change);

    return () => {
      document.removeEventListener('keydown', process_key_down);
      document.removeEventListener('keyup', process_key_up);
      document.removeEventListener('pointerlockchange', handle_pointer_lock_change);
    };
  }, []);

  return movement;
};
