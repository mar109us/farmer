import { CHUNK_SIZE } from "../data/definitions.js";
import {
  createChunk,
  createGameState,
  createTile,
  getTile,
} from "../data/world.js";
import {
  addWater,
  dryTiles,
  getSoilDrainPerDay,
  isValidSoil,
  setTileSoil,
} from "../data/water.js";
import { growCrops, harvestCrop, plantCrop, tillTile } from "../data/crops.js";
import { updateWorldState } from "../data/sleep.js";
import { expectEqual, logTestSummary, test } from "./testHelper.js";

function createStateWithCarrot() {
  const state = createGameState();
  tillTile(state, 0, 0);
  plantCrop(state, 0, 0, "carrot");
  return state;
}

test("creates a 16 × 16 chunk of grass", () => {
  const chunk = createChunk();
  expectEqual(chunk.length, CHUNK_SIZE);

  for (const row of chunk) {
    expectEqual(row.length, CHUNK_SIZE);
    for (const tile of row) {
      expectEqual(tile.type, "grass");
    }
  }
});

test("new tile is all loam", () => {
  const tile = createTile();
  expectEqual(tile.soil.sandy, 0);
  expectEqual(tile.soil.loam, 10);
  expectEqual(tile.soil.clay, 0);
});

test("getTile returns the same tile on repeat calls", () => {
  const state = createGameState();
  expectEqual(getTile(state, 3, 4), getTile(state, 3, 4));
});

test("getTile puts negative coordinates in the right chunk", () => {
  const state = createGameState();
  const tile = getTile(state, -1, 0);
  expectEqual(tile, state.chunks["-1,0"][0][15]);
});

test("tile (16, 0) lands in a different chunk from tile (15, 0)", () => {
  const state = createGameState();
  const tileInFirstChunk = getTile(state, 15, 0);
  const tileInSecondChunk = getTile(state, 16, 0);
  expectEqual(tileInFirstChunk, state.chunks["0,0"][0][15]);
  expectEqual(tileInSecondChunk, state.chunks["1,0"][0][0]);
});

test("accepts a mix that adds up to 10", () => {
  const soil = {
    sandy: 5,
    loam: 3,
    clay: 2,
  };
  expectEqual(isValidSoil(soil), true);
});

test("rejects a mix that does not add up to 10", () => {
  const soil = {
    sandy: 5,
    loam: 3,
    clay: 1,
  };
  expectEqual(isValidSoil(soil), false);
});

test("rejects an amount above 10", () => {
  const soil = {
    sandy: 11,
    loam: -1,
    clay: 0,
  };
  expectEqual(isValidSoil(soil), false);
});

test("rejects an amount below 0", () => {
  const soil = {
    sandy: -1,
    loam: 11,
    clay: 0,
  };
  expectEqual(isValidSoil(soil), false);
});

test("setTileSoil refuses an invalid mix", () => {
  const state = createGameState();
  const soil = {
    sandy: 1,
    loam: 1,
    clay: 1,
  };
  expectEqual(setTileSoil(state, 0, 0, soil), null);
});

test("7 sandy, 2 loam, 1 clay drains 1.6 per day", () => {
  const soil = {
    sandy: 7,
    loam: 2,
    clay: 1,
  };
  expectEqual(getSoilDrainPerDay(soil), 1.6);
});

test("addWater raises the level", () => {
  const state = createGameState();
  expectEqual(addWater(state, 0, 0, 2), 7);
});

test("addWater never goes above 10", () => {
  const state = createGameState();
  expectEqual(addWater(state, 0, 0, 50), 10);
});

test("addWater keeps one decimal place", () => {
  const state = createGameState();
  getTile(state, 0, 0).waterLevel = 0.1;
  expectEqual(addWater(state, 0, 0, 0.2), 0.3);
});

test("addWater refuses a water tile", () => {
  const state = createGameState();
  getTile(state, 0, 0).type = "water";
  expectEqual(addWater(state, 0, 0, 2), null);
});

test("addWater refuses an amount of 0", () => {
  const state = createGameState();
  expectEqual(addWater(state, 0, 0, 0), null);
});

test("tills grass", () => {
  const state = createGameState();
  tillTile(state, 0, 0);
  expectEqual(getTile(state, 0, 0).type, "soil");
});

test("refuses to till water", () => {
  const state = createGameState();
  getTile(state, 0, 0).type = "water";
  expectEqual(tillTile(state, 0, 0), null);
});

test("plants on soil", () => {
  const state = createStateWithCarrot();
  expectEqual(getTile(state, 0, 0).crop.type, "carrot");
});

test("refuses a second crop", () => {
  const state = createStateWithCarrot();
  expectEqual(plantCrop(state, 0, 0, "wheat"), null);
});

test("refuses an unknown seed", () => {
  const state = createGameState();
  tillTile(state, 0, 0);
  expectEqual(plantCrop(state, 0, 0, "banana"), null);
});

test("harvest refuses an unready crop", () => {
  const state = createStateWithCarrot();
  expectEqual(harvestCrop(state, 0, 0), null);
  expectEqual(getTile(state, 0, 0).crop.type, "carrot");
});

test("harvest clears a ready crop and returns its item name", () => {
  const state = createStateWithCarrot();
  getTile(state, 0, 0).crop.daysGrown = 3;
  expectEqual(harvestCrop(state, 0, 0), "carrot");
  expectEqual(getTile(state, 0, 0).crop, null);
});

test("crop grows when water is in range", () => {
  const state = createStateWithCarrot();
  growCrops(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 0.5);
});

test("crop does not grow below its minimum water", () => {
  const state = createStateWithCarrot();
  getTile(state, 0, 0).waterLevel = 2;
  growCrops(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 0);
});

test("crop does not grow above its maximum water", () => {
  const state = createStateWithCarrot();
  getTile(state, 0, 0).waterLevel = 9;
  growCrops(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 0);
});

test("crop grows 1 day in its ideal soil", () => {
  const state = createStateWithCarrot();
  const soil = {
    sandy: 5,
    loam: 5,
    clay: 0,
  };
  setTileSoil(state, 0, 0, soil);
  growCrops(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 1);
});

test("crop grows 0.5 day in a poor soil match", () => {
  const state = createStateWithCarrot();
  growCrops(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 0.5);
});

test("crop grows 0.25 day in the wrong soil", () => {
  const state = createStateWithCarrot();
  const soil = {
    sandy: 0,
    loam: 0,
    clay: 10,
  };
  setTileSoil(state, 0, 0, soil);
  growCrops(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 0.25);
});

test("daily loss adds soil, crop and weather together", () => {
  const state = createStateWithCarrot();
  dryTiles(state);
  expectEqual(getTile(state, 0, 0).waterLevel, 2.5);
});

test("water never drops below 0", () => {
  const state = createGameState();
  getTile(state, 0, 0).waterLevel = 0.5;
  dryTiles(state);
  expectEqual(getTile(state, 0, 0).waterLevel, 0);
});

test("a tile with no crop skips crop water use", () => {
  const state = createGameState();
  getTile(state, 0, 0);
  dryTiles(state);
  expectEqual(getTile(state, 0, 0).waterLevel, 3);
});

test("rainy weather adds water before crops grow", () => {
  const state = createStateWithCarrot();
  state.weather = "rainy";
  getTile(state, 0, 0).waterLevel = 1;
  updateWorldState(state);
  expectEqual(getTile(state, 0, 0).crop.daysGrown, 0.5);
  expectEqual(getTile(state, 0, 0).waterLevel, 2.5);
});

test("water tiles are not dried", () => {
  const state = createGameState();
  const tile = getTile(state, 0, 0);
  tile.type = "water";
  tile.waterLevel = 10;
  dryTiles(state);
  expectEqual(tile.waterLevel, 10);
});

logTestSummary();
