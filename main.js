import { createGameState } from "./data/world.js";
import { tillTile } from "./data/crops.js";
import { renderWorld } from "./view/scene.js";

function tillStartingPatch(state) {
  for (let y = 4; y < 8; y++) {
    for (let x = 4; x < 8; x++) {
      tillTile(state, x, y);
    }
  }
}

function startGame() {
  const state = createGameState();
  tillStartingPatch(state);
  renderWorld(state);
}

startGame();
