export const CHUNK_SIZE = 16;
export const SOIL_TOTAL = 10;
export const MAX_WATER_LEVEL = 10;
export const STARTING_WATER_LEVEL = 5;

export const SOIL_TYPES = {
  sandy: {
    name: "Sandy soil",
    drainPerDay: 2,
  },
  loam: {
    name: "Loam",
    drainPerDay: 1,
  },
  clay: {
    name: "Clay",
    drainPerDay: 0,
  },
};

export const WEATHER_TYPES = {
  sunny: {
    name: "Sunny",
    dryingPerDay: 1,
    rainPerDay: 0,
  },
  cloudy: {
    name: "Cloudy",
    dryingPerDay: 0,
    rainPerDay: 0,
  },
  rainy: {
    name: "Rainy",
    dryingPerDay: 0,
    rainPerDay: 3,
  },
};

export const ITEM_TYPES = {
  seed: {
    carrot: {
      name: "Carrot seed",
      weightKg: 0.01,
      maxStack: 99,
      width: 1,
      height: 1,
      isTwoHanded: false,
      daysToGrow: 3,
      minWaterLevel: 3,
      maxWaterLevel: 8,
      waterUsePerDay: 0.5,
      idealSoil: {
        sandy: 5,
        loam: 5,
        clay: 0,
      },
      harvestItem: "carrot",
    },
    wheat: {
      name: "Wheat seed",
      weightKg: 0.01,
      maxStack: 99,
      width: 1,
      height: 1,
      isTwoHanded: false,
      daysToGrow: 4,
      minWaterLevel: 2,
      maxWaterLevel: 7,
      waterUsePerDay: 0.3,
      idealSoil: {
        sandy: 1,
        loam: 6,
        clay: 3,
      },
      harvestItem: "wheat",
    },
  },
  plant: {
    carrot: {
      name: "Carrot",
      weightKg: 0.2,
      maxStack: 20,
      width: 1,
      height: 1,
      isTwoHanded: false,
    },
    wheat: {
      name: "Wheat",
      weightKg: 0.1,
      maxStack: 20,
      width: 1,
      height: 1,
      isTwoHanded: false,
    },
  },
};
