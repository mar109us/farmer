import { createGameState, getTile } from "../data/world.js";
import {
  buildStatsText,
  calculateFramesPerSecond,
  countChunks,
  getChunkCoordinate,
} from "../debug/debugPanel.js";
import {
  addToHistory,
  buildGraphHtml,
  findHighest,
  getBarHeight,
} from "../debug/fpsGraph.js";
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

test("getChunkCoordinate finds the chunk for a decimal position", () => {
  expectEqual(getChunkCoordinate(8.5), 0);
  expectEqual(getChunkCoordinate(16.5), 1);
});

test("getChunkCoordinate puts negative positions in the right chunk", () => {
  expectEqual(getChunkCoordinate(-0.5), -1);
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
Draw calls: 256
Triangles: 3072

position
x: 8.0
y: 8.0
z: 0.0

chunk
x: 0
y: 0`;

  expectEqual(buildStatsText(60, state, fakeRenderer), expectedText);
});

test("adds a value to the history", () => {
  const history = [];
  addToHistory(history, 60);
  expectEqual(history.length, 1);
  expectEqual(history[0], 60);
});

test("keeps only the newest 40 values", () => {
  const history = [];
  for (let value = 1; value <= 41; value++) {
    addToHistory(history, value);
  }
  expectEqual(history.length, 40);
  expectEqual(history[0], 2);
  expectEqual(history[39], 41);
});

test("finds the highest value in the history", () => {
  expectEqual(findHighest([30, 60, 45]), 60);
});

test("finds 0 as the highest value of an empty history", () => {
  expectEqual(findHighest([]), 0);
});

test("gives the highest value a full height bar", () => {
  expectEqual(getBarHeight(60, 60), 40);
});

test("gives half the highest value a half height bar", () => {
  expectEqual(getBarHeight(30, 60), 20);
});

test("gives a zero height bar when the highest value is 0", () => {
  expectEqual(getBarHeight(0, 0), 0);
});

test("builds one bar for each value", () => {
  const expectedHtml = `<div class="debugBar" style="height: 40px"></div><div class="debugBar" style="height: 20px"></div>`;
  expectEqual(buildGraphHtml([60, 30]), expectedHtml);
});

logTestSummary();
