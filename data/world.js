import { CHUNK_SIZE, STARTING_WATER_LEVEL } from "./definitions.js";

export function createSoil() {
  return {
    sandy: 0,
    loam: 10,
    clay: 0,
  };
}

export function createTile() {
  return {
    type: "grass",
    soil: createSoil(),
    waterLevel: STARTING_WATER_LEVEL,
    crop: null,
    items: [],
  };
}

export function createChunk() {
  const chunk = [];
  for (let rowIndex = 0; rowIndex < CHUNK_SIZE; rowIndex++) {
    const row = [];
    for (let columnIndex = 0; columnIndex < CHUNK_SIZE; columnIndex++) {
      row.push(createTile());
    }
    chunk.push(row);
  }
  return chunk;
}

export function createGameState() {
  return {
    weather: "sunny",
    chunks: {},
    player: {
      x: 8,
      y: 8,
      z: 0,
      yaw: 0,
      pitch: 0,
    },
  };
}

export function getChunkKey(chunkX, chunkY) {
  return `${chunkX},${chunkY}`;
}

export function getTile(state, x, y) {
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkY = Math.floor(y / CHUNK_SIZE);
  const chunkKey = getChunkKey(chunkX, chunkY);

  if (state.chunks[chunkKey] === undefined) {
    state.chunks[chunkKey] = createChunk();
  }

  const localX = x - chunkX * CHUNK_SIZE;
  const localY = y - chunkY * CHUNK_SIZE;
  return state.chunks[chunkKey][localY][localX];
}

export function getAllTiles(state) {
  const tiles = [];
  for (const chunkKey in state.chunks) {
    for (const row of state.chunks[chunkKey]) {
      for (const tile of row) {
        tiles.push(tile);
      }
    }
  }
  return tiles;
}
