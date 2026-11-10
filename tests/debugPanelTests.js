import { createGameState, getTile } from "../data/world.js";
import {
  buildStatsText,
  calculateFramesPerSecond,
  countChunks,
  getChunkKeyAt,
} from "../debug/debugPanel.js";
import { expectEqual, logTestSummary, test } from "./testHelper.js";

test("counts zero chunks in a new game", () => {
  const state = createGameState();
  expectEqual(countChunks(state), 0);
});

test("counts each chunk once", () => {
  const state = createGameState();
  getTile(state, 0, 0);
  getTile(state, 1, 1);
  getTile(state, 16, 0);
  expectEqual(countChunks(state), 2);
});

test("getChunkKeyAt finds the chunk for a decimal position", () => {
  expectEqual(getChunkKeyAt(8.5, 8.5), "0,0");
  expectEqual(getChunkKeyAt(16.5, 3.2), "1,0");
});

test("getChunkKeyAt puts negative positions in the right chunk", () => {
  expectEqual(getChunkKeyAt(-0.5, 0), "-1,0");
});

test("calculates 60 frames per second from 30 frames in 500 milliseconds", () => {
  expectEqual(calculateFramesPerSecond(30, 500), 60);
});

test("builds the stats text from the state and renderer", () => {
  const state = createGameState();
  getTile(state, 0, 0);
  const fakeRenderer = {
    info: {
      render: {
        calls: 256,
        triangles: 3072,
      },
    },
  };

  const expectedText = `FPS: 60
Chunks loaded: 1
Position: 8.0, 8.0 (chunk 0,0)
Draw calls: 256
Triangles: 3072`;

  expectEqual(buildStatsText(60, state, fakeRenderer), expectedText);
});

logTestSummary();
