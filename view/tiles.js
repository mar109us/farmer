import * as THREE from "three";
import { CHUNK_SIZE } from "../data/definitions.js";
import { getTile } from "../data/world.js";

const TILE_THICKNESS = 0.2;

const TILE_COLORS = {
  grass: 0x4c9a2a,
  soil: 0x7a4f2b,
  water: 0x2f7fd1,
  path: 0x9a9a9a,
};

function getTileColor(tile) {
  return TILE_COLORS[tile.type];
}

function createTileMesh(tile, x, y) {
  const geometry = new THREE.BoxGeometry(1, TILE_THICKNESS, 1);
  const material = new THREE.MeshLambertMaterial({
    color: getTileColor(tile),
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x + 0.5, 0, y + 0.5);
  return mesh;
}

export function drawChunk(scene, state) {
  for (let y = 0; y < CHUNK_SIZE; y++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      const tile = getTile(state, x, y);
      scene.add(createTileMesh(tile, x, y));
    }
  }
}
