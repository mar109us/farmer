import { SOIL_TYPES, ITEM_TYPES } from "./definitions.js";
import { getAllTiles, getTile } from "./world.js";

export function tillTile(state, x, y) {
  const tile = getTile(state, x, y);
  if (tile.type !== "grass") {
    return null;
  }

  tile.type = "soil";
  return tile;
}

export function plantCrop(state, x, y, seedName) {
  const tile = getTile(state, x, y);
  if (tile.type !== "soil" || tile.crop !== null) {
    return null;
  }
  if (ITEM_TYPES.seed[seedName] === undefined) {
    return null;
  }

  tile.crop = {
    type: seedName,
    daysGrown: 0,
  };
  return tile;
}

export function isCropReady(crop) {
  const seedType = ITEM_TYPES.seed[crop.type];
  return crop.daysGrown >= seedType.daysToGrow;
}

export function harvestCrop(state, x, y) {
  const tile = getTile(state, x, y);
  if (tile.crop === null || !isCropReady(tile.crop)) {
    return null;
  }

  const seedType = ITEM_TYPES.seed[tile.crop.type];
  tile.crop = null;
  return seedType.harvestItem;
}

export function getSoilGrowthRate(soil, seedType) {
  let totalDifference = 0;
  for (const soilName in SOIL_TYPES) {
    const difference = soil[soilName] - seedType.idealSoil[soilName];
    totalDifference = totalDifference + Math.abs(difference);
  }

  if (totalDifference <= 4) {
    return 1;
  }
  if (totalDifference <= 10) {
    return 0.5;
  }
  return 0.25;
}

export function isWaterInRange(waterLevel, seedType) {
  return (
    waterLevel >= seedType.minWaterLevel && waterLevel <= seedType.maxWaterLevel
  );
}

export function growCrops(state) {
  for (const tile of getAllTiles(state)) {
    if (tile.crop === null) {
      continue;
    }

    const seedType = ITEM_TYPES.seed[tile.crop.type];
    if (isWaterInRange(tile.waterLevel, seedType)) {
      const growthRate = getSoilGrowthRate(tile.soil, seedType);
      tile.crop.daysGrown = tile.crop.daysGrown + growthRate;
    }
  }
}
