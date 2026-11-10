import { growCrops } from "./crops.js";
import { dryTiles, rainOnTiles } from "./water.js";

export function updateWorldState(state) {
  rainOnTiles(state);
  growCrops(state);
  dryTiles(state);
}
