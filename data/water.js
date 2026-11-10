import {
  SOIL_TOTAL,
  MAX_WATER_LEVEL,
  SOIL_TYPES,
  WEATHER_TYPES,
  ITEM_TYPES,
} from "./definitions.js";
import { getAllTiles, getTile } from "./world.js";

export function isValidSoil(soil) {
  let total = 0;
  for (const soilName in SOIL_TYPES) {
    const amount = soil[soilName];
    if (typeof amount !== "number") {
      return false;
    }
    if (amount < 0 || amount > SOIL_TOTAL) {
      return false;
    }
    total = total + amount;
  }
  return total === SOIL_TOTAL;
}

export function setTileSoil(state, x, y, soil) {
  if (!isValidSoil(soil)) {
    return null;
  }

  const tile = getTile(state, x, y);
  tile.soil = {
    sandy: soil.sandy,
    loam: soil.loam,
    clay: soil.clay,
  };
  return tile;
}

export function getSoilDrainPerDay(soil) {
  let totalDrain = 0;
  for (const soilName in SOIL_TYPES) {
    totalDrain = totalDrain + soil[soilName] * SOIL_TYPES[soilName].drainPerDay;
  }
  return totalDrain / SOIL_TOTAL;
}

export function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

export function limitWaterLevel(level) {
  const limitedLevel = Math.max(0, Math.min(MAX_WATER_LEVEL, level));
  return roundToOneDecimal(limitedLevel);
}

function addWaterToTile(tile, amount) {
  if (amount <= 0 || tile.type === "water") {
    return null;
  }

  tile.waterLevel = limitWaterLevel(tile.waterLevel + amount);
  return tile.waterLevel;
}

export function addWater(state, x, y, amount) {
  return addWaterToTile(getTile(state, x, y), amount);
}

export function rainOnTiles(state) {
  const rainAmount = WEATHER_TYPES[state.weather].rainPerDay;
  for (const tile of getAllTiles(state)) {
    addWaterToTile(tile, rainAmount);
  }
}

function getDailyWaterLoss(tile, weatherName) {
  const weatherLoss = WEATHER_TYPES[weatherName].dryingPerDay;
  const soilLoss = getSoilDrainPerDay(tile.soil);
  if (tile.crop === null) {
    return soilLoss + weatherLoss;
  }

  const seedType = ITEM_TYPES.seed[tile.crop.type];
  return soilLoss + weatherLoss + seedType.waterUsePerDay;
}

export function dryTiles(state) {
  for (const tile of getAllTiles(state)) {
    if (tile.type === "water") {
      continue;
    }

    const waterLoss = getDailyWaterLoss(tile, state.weather);
    tile.waterLevel = limitWaterLevel(tile.waterLevel - waterLoss);
  }
}
