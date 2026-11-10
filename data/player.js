import { MAX_PITCH, MOUSE_SENSITIVITY, WALK_SPEED } from "./definitions.js";

export function limitPitch(pitch) {
  return Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
}

export function turnPlayer(state, mouseMovementX, mouseMovementY) {
  const player = state.player;
  const newPitch = player.pitch - mouseMovementY * MOUSE_SENSITIVITY;
  player.yaw = player.yaw - mouseMovementX * MOUSE_SENSITIVITY;
  player.pitch = limitPitch(newPitch);
}

export function getWalkInput(keysHeld) {
  let forward = 0;
  let sideways = 0;

  if (keysHeld.KeyW === true) {
    forward = forward + 1;
  }
  if (keysHeld.KeyS === true) {
    forward = forward - 1;
  }
  if (keysHeld.KeyD === true) {
    sideways = sideways + 1;
  }
  if (keysHeld.KeyA === true) {
    sideways = sideways - 1;
  }

  return {
    forward: forward,
    sideways: sideways,
  };
}

export function movePlayer(state, walkInput, seconds) {
  const forward = walkInput.forward;
  const sideways = walkInput.sideways;
  if (forward === 0 && sideways === 0) {
    return;
  }

  const player = state.player;
  const sinYaw = Math.sin(player.yaw);
  const cosYaw = Math.cos(player.yaw);
  const directionX = sideways * cosYaw - forward * sinYaw;
  const directionY = -sideways * sinYaw - forward * cosYaw;
  const inputLength = Math.hypot(forward, sideways);
  const distance = (WALK_SPEED * seconds) / inputLength;

  player.x = player.x + directionX * distance;
  player.y = player.y + directionY * distance;
}
