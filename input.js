import { turnPlayer } from "./data/player.js";

export const keysHeld = {};

function handleKeyDown(event, state) {
  if (event.repeat) {
    return;
  }

  keysHeld[event.code] = true;
  console.table(state.player);
}

function handleKeyUp(event, state) {
  keysHeld[event.code] = false;
  console.table(state.player);
}

function handleMouseMove(event, state, canvas) {
  if (document.pointerLockElement !== canvas) {
    return;
  }

  turnPlayer(state, event.movementX, event.movementY);
}

function releaseAllKeys() {
  for (const code in keysHeld) {
    keysHeld[code] = false;
  }
}

export function listenForInput(state, canvas) {
  document.addEventListener("keydown", (event) => handleKeyDown(event, state));
  document.addEventListener("keyup", (event) => handleKeyUp(event, state));
  document.addEventListener("mousemove", (event) =>
    handleMouseMove(event, state, canvas),
  );
  document.addEventListener("pointerlockchange", () =>
    console.table(state.player),
  );
  canvas.addEventListener("click", () => canvas.requestPointerLock());
  window.addEventListener("blur", releaseAllKeys);
}
