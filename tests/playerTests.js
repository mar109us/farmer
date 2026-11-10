import { MAX_PITCH, WALK_SPEED } from "../data/definitions.js";
import { getWalkInput, movePlayer, turnPlayer } from "../data/player.js";
import { roundToOneDecimal } from "../data/water.js";
import { createGameState } from "../data/world.js";
import { expectEqual, logTestSummary, test } from "./testHelper.js";

test("player starts in the middle of the chunk, looking straight ahead", () => {
  const player = createGameState().player;
  expectEqual(player.x, 8);
  expectEqual(player.y, 8);
  expectEqual(player.yaw, 0);
  expectEqual(player.pitch, 0);
});

test("moving the mouse right lowers yaw", () => {
  const state = createGameState();
  turnPlayer(state, 100, 0);
  expectEqual(state.player.yaw < 0, true);
});

test("moving the mouse up raises pitch", () => {
  const state = createGameState();
  turnPlayer(state, 0, -100);
  expectEqual(state.player.pitch > 0, true);
});

test("pitch stops at the upper limit", () => {
  const state = createGameState();
  turnPlayer(state, 0, -100000);
  expectEqual(state.player.pitch, MAX_PITCH);
});

test("pitch stops at the lower limit", () => {
  const state = createGameState();
  turnPlayer(state, 0, 100000);
  expectEqual(state.player.pitch, -MAX_PITCH);
});

test("W at yaw 0 moves toward lower y", () => {
  const state = createGameState();
  const walkInput = getWalkInput({
    KeyW: true,
  });
  movePlayer(state, walkInput, 1);
  expectEqual(state.player.x, 8);
  expectEqual(state.player.y, 8 - WALK_SPEED);
});

test("S at yaw 0 moves toward higher y", () => {
  const state = createGameState();
  const walkInput = getWalkInput({
    KeyS: true,
  });
  movePlayer(state, walkInput, 1);
  expectEqual(state.player.y, 8 + WALK_SPEED);
});

test("D at yaw 0 moves toward higher x", () => {
  const state = createGameState();
  const walkInput = getWalkInput({
    KeyD: true,
  });
  movePlayer(state, walkInput, 1);
  expectEqual(state.player.x, 8 + WALK_SPEED);
  expectEqual(state.player.y, 8);
});

test("half a second moves half as far", () => {
  const state = createGameState();
  const walkInput = getWalkInput({
    KeyW: true,
  });
  movePlayer(state, walkInput, 0.5);
  expectEqual(state.player.y, 8 - WALK_SPEED / 2);
});

test("W + D together moves the same distance as W alone", () => {
  const state = createGameState();
  const walkInput = getWalkInput({
    KeyW: true,
    KeyD: true,
  });
  movePlayer(state, walkInput, 1);
  const distance = Math.hypot(state.player.x - 8, state.player.y - 8);
  expectEqual(roundToOneDecimal(distance), WALK_SPEED);
});

test("no keys held does not move the player", () => {
  const state = createGameState();
  movePlayer(state, getWalkInput({}), 1);
  expectEqual(state.player.x, 8);
  expectEqual(state.player.y, 8);
});

test("W + S together cancel out", () => {
  const state = createGameState();
  const walkInput = getWalkInput({
    KeyW: true,
    KeyS: true,
  });
  movePlayer(state, walkInput, 1);
  expectEqual(state.player.y, 8);
});

logTestSummary();
