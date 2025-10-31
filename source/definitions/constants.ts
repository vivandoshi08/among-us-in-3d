export const MOVEMENT = {
  WALK_SPEED: 4.2,
  SPRINT_SPEED: 6.8,
  JUMP_FORCE: 5,
};

export const CAMERA = {
  FOV: 55,
  TPP_OFFSET: 8,
  MAX_POLAR_ANGLE: Math.PI - 0.8,
  MIN_POLAR_ANGLE: Math.PI / 2.3,
  DEATH_LERP_FACTOR: 0.04,
  FOLLOW_LERP_FACTOR: 0.12,
};

export const PHYSICS = {
  GRAVITY: -8.5,
};

export const GAME = {
  KILL_COOLDOWN_MS: 25000,
  KILL_RANGE: 2.5,
};

export const ANIMATION = {
  DEATH_DURATION: 1.2,
};

export const NETWORK = {
  SYNC_INTERVAL: 16,
  SYNC_FALLBACK: 750,
};
