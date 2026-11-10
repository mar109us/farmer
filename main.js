import { createGameState } from "./data/world.js";
import { tillTile } from "./data/crops.js";
import { getWalkInput, movePlayer } from "./data/player.js";
import { keysHeld, listenForInput } from "./input.js";
import { createWorldView, drawFrame } from "./view/scene.js";

const MAX_FRAME_SECONDS = 0.1;

function tillStartingPatch(state) {
  for (let y = 4; y < 8; y++) {
    for (let x = 4; x < 8; x++) {
      tillTile(state, x, y);
    }
  }
}

function getSecondsSinceLastFrame(currentTime, lastFrameTime) {
  const seconds = (currentTime - lastFrameTime) / 1000;
  return Math.min(seconds, MAX_FRAME_SECONDS);
}

function startGameLoop(state, view) {
  let lastFrameTime = performance.now();

  function gameLoop(currentTime) {
    const seconds = getSecondsSinceLastFrame(currentTime, lastFrameTime);
    lastFrameTime = currentTime;

    movePlayer(state, getWalkInput(keysHeld), seconds);
    drawFrame(view, state.player);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

function startGame() {
  const state = createGameState();
  tillStartingPatch(state);

  const view = createWorldView(state);
  listenForInput(state, view.renderer.domElement);
  startGameLoop(state, view);
}

startGame();
