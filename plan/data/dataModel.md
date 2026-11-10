# Farm game: complete data model

## Context
The `farmer` folder is empty. The game will be first-person 3D, drawn with three.js. This document is the model: the data and the rules that change it, designed decision by decision. No drawing yet.

**Ground rules:** ES modules, no dependencies, state changes live while playing, saving writes to localStorage, functions return `null` on failure, tests are vanilla JS logging to the browser console. Every object property goes on its own line.

**Approving this plan means:**
1. Add the object-formatting rule to `/Users/ionide/.claude/CLAUDE.md` (see "CLAUDE.md change").
2. Build **Step 1 only**. Each later step gets its own short plan and go-ahead.

## Decisions

### World
| Topic | Decision |
|---|---|
| Map | Chunks of 16 × 16 tiles, created on demand, new tiles are grass, endless in every direction |
| Storage | `state.chunks["chunkX,chunkY"]` = array of rows (`chunk[localY][localX]`) |
| Access rule | Only `getTile(state, x, y)` touches chunks |
| Tile types | `grass`, `soil`, `water`, `path` |
| Crops | On the tile: `tile.crop`, or `null`. `crop.type` is the key of its seed in `ITEM_TYPES.seed` |
| Ground items | `tile.items` = list of stacks, same item merges up to `maxStack`; can share a tile with a crop |
| New day | Starts when the player sleeps, which calls `updateWorldState`. Sleeping is not built yet |

### Soil, water and weather
| Topic | Decision |
|---|---|
| Soil mix | Every tile has `soil` with `sandy`, `loam`, `clay`, each 0-10, always adding up to 10 |
| New tiles | Sandy 0, loam 10, clay 0 |
| Water | Every tile has `waterLevel`, 0-10, one decimal place. New tiles start at 5 (starting value to tune) |
| Water tiles | Tiles of type `water` are skipped by drying |
| Sources | Rain, irrigation and hand watering all go through `addWater(state, x, y, amount)` |
| Daily loss | Soil drainage + crop water use (if planted) + weather drying, never below 0 |
| Soil drainage | Weighted average: each amount × its soil type's `drainPerDay`, added up, divided by 10 |
| Growth: water | A crop only grows if `waterLevel` is within its seed's `minWaterLevel` to `maxWaterLevel` |
| Growth: soil | The mix also changes how fast it grows (see proposal below) |
| Weather | One value for the whole world: `state.weather`. Step 1 uses whatever it is set to; nothing changes it yet |
| Day order | Rain, then grow, then dry |

**Proposal, for you to review: how soil preference slows growth.** Each seed has an `idealSoil` mix. Add up how far each of the tile's amounts is from the ideal:

| Total difference | Growth that day |
|---|---|
| 0 to 4 | 1 day |
| 5 to 10 | 0.5 day |
| 11 to 20 | 0.25 day |

`daysGrown` can therefore be a decimal.

### Items and hands
| Topic | Decision |
|---|---|
| Categories | `ITEM_TYPES` is nested: `seed`, `plant`, `currency`, `tool`, `material`, `container`, `clothing` |
| Finding an item | A stack stores `category` and `item`; `getItemType(stack)` looks up its definition |
| Growing info | Lives on the seed; there is no `CROP_TYPES` |
| Harvest | `harvestItem` is a key in `ITEM_TYPES.plant` |
| Carrying | Hands (`left`, `right`, `bothHands`) plus any containers and clothing you carry |
| Weight | Max 30 kg per hand; hands + worn max 60 kg total, counting everything inside containers |
| Two-handed | Over 30 kg, or `isTwoHanded: true` → goes in `bothHands`, and left and right must be empty |
| Stacks | Limited by each item's `maxStack` and by weight |
| Pickup | First free hand; `settings.dominantHand` decides which is tried first |
| Full hands | Item drops on the ground |
| Money | One physical `currency.coin` item with weight |

### Containers and clothing
| Topic | Decision |
|---|---|
| Space | Tarkov-style grids; each item has `width` × `height` |
| Placement | Items in a grid store `x` and `y` |
| Rotation | Only items whose width and height differ store `isRotated`; width and height swap when true |
| Nesting | Containers can go inside containers |
| Fits inside | Must fit in free cells and pass the grid's allowed lists |
| Allowed lists | `allowedCategories` and `allowedItems`. If both are `null`, anything fits; otherwise the item must match at least one |
| Pockets | One item can have several `inventoryGrids`, each with its own `contents` |
| Body spots | `head`, `torso`, `legs`, `feet`, `back` |
| Clothing | Fills one spot (`wornOnSlot`), can bring grids, and can add attachment spots |
| Backpack | In the `container` category; worn on `back` or held in a hand |

## Definitions: what kinds of things exist

All numbers are starting values to tune while playing.

```js
const CHUNK_SIZE = 16;
const SOIL_TOTAL = 10;
const MAX_WATER_LEVEL = 10;

const SOIL_TYPES = {
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

const WEATHER_TYPES = {
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

const ITEM_TYPES = {
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
  currency: {
    coin: {
      name: "Coin",
      weightKg: 0.005,
      maxStack: 500,
      width: 1,
      height: 1,
      isTwoHanded: false,
    },
  },
  tool: {
    hoe: {
      name: "Hoe",
      weightKg: 2,
      maxStack: 1,
      width: 3,
      height: 1,
      isTwoHanded: false,
    },
    scythe: {
      name: "Scythe",
      weightKg: 3,
      maxStack: 1,
      width: 4,
      height: 2,
      isTwoHanded: true,
    },
  },
  material: {
    hayBale: {
      name: "Hay bale",
      weightKg: 35,
      maxStack: 1,
      width: 4,
      height: 4,
      isTwoHanded: false,
    },
  },
  container: {
    wallet: {
      name: "Wallet",
      weightKg: 0.2,
      maxStack: 1,
      width: 2,
      height: 1,
      isTwoHanded: false,
      inventoryGrids: [
        {
          width: 2,
          height: 2,
          allowedCategories: ["currency"],
          allowedItems: null,
        },
      ],
    },
    backpack: {
      name: "Backpack",
      weightKg: 1,
      maxStack: 1,
      width: 3,
      height: 3,
      isTwoHanded: false,
      wornOnSlot: "back",
      inventoryGrids: [
        {
          width: 5,
          height: 4,
          allowedCategories: null,
          allowedItems: null,
        },
      ],
    },
  },
  clothing: {
    jacket: {
      name: "Jacket",
      weightKg: 1.5,
      maxStack: 1,
      width: 2,
      height: 3,
      isTwoHanded: false,
      wornOnSlot: "torso",
      inventoryGrids: [
        {
          width: 2,
          height: 1,
          allowedCategories: null,
          allowedItems: null,
        },
        {
          width: 2,
          height: 1,
          allowedCategories: null,
          allowedItems: null,
        },
      ],
    },
  },
};
```

`allowedCategories` is the normal way to limit a grid. `allowedItems` names exact items, using both parts because names can repeat across categories:

```js
const hoeCaseGrid = {
  width: 3,
  height: 1,
  allowedCategories: null,
  allowedItems: [
    {
      category: "tool",
      item: "hoe",
    },
  ],
};
```

## Live state: an example moment in the game

Real chunks hold 16 rows of 16 tiles. This example shows 1 row of 3 tiles to stay readable.

```js
const state = {
  weather: "sunny",
  chunks: {
    "0,0": [
      [
        {
          type: "grass",
          soil: {
            sandy: 0,
            loam: 10,
            clay: 0,
          },
          waterLevel: 5,
          crop: null,
          items: [],
        },
        {
          type: "soil",
          soil: {
            sandy: 7,
            loam: 2,
            clay: 1,
          },
          waterLevel: 4.4,
          crop: {
            type: "carrot",
            daysGrown: 1.5,
          },
          items: [],
        },
        {
          type: "soil",
          soil: {
            sandy: 0,
            loam: 10,
            clay: 0,
          },
          waterLevel: 0,
          crop: null,
          items: [
            {
              category: "plant",
              item: "carrot",
              count: 12,
            },
          ],
        },
      ],
    ],
  },
  player: {
    x: 3,
    y: 5,
    yaw: 0,
    pitch: 0,
    settings: {
      dominantHand: "right",
    },
    hands: {
      left: {
        category: "seed",
        item: "carrot",
        count: 40,
      },
      right: {
        category: "tool",
        item: "hoe",
        count: 1,
      },
      bothHands: null,
    },
    worn: {
      head: null,
      torso: {
        category: "clothing",
        item: "jacket",
        count: 1,
        inventoryGrids: [
          {
            contents: [
              {
                category: "currency",
                item: "coin",
                count: 5,
                x: 0,
                y: 0,
              },
            ],
          },
          {
            contents: [],
          },
        ],
      },
      legs: null,
      feet: null,
      back: {
        category: "container",
        item: "backpack",
        count: 1,
        inventoryGrids: [
          {
            contents: [
              {
                category: "plant",
                item: "carrot",
                count: 10,
                x: 0,
                y: 0,
              },
              {
                category: "container",
                item: "wallet",
                count: 1,
                x: 1,
                y: 0,
                isRotated: true,
                inventoryGrids: [
                  {
                    contents: [
                      {
                        category: "currency",
                        item: "coin",
                        count: 25,
                        x: 0,
                        y: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
};
```

## How to read the model
- `ITEM_TYPES` says what a hoe is, once. A stack in the state only says `category: "tool"` and `item: "hoe"`, and looks up the rest with `ITEM_TYPES[stack.category][stack.item]`.
- A growing crop looks up its rules with `ITEM_TYPES.seed[crop.type]`.
- The allowed lists are on the definition because a pocket's rules never change. `contents` is on the state because what's inside does. The two `inventoryGrids` arrays match by position.
- `x` and `y` only exist on items placed in a grid. A stack in a hand or on the ground has no position. A 1×1 item has no `isRotated`.
- The player's `x` and `y` are world positions in tiles and can be decimals, so the tile underneath is `Math.floor` of each; an item's `x` and `y` are cells inside its grid.

## Build order
1. Chunks + tiles + soil + water + weather rules + crops, with the `seed` and `plant` categories (**this approval**)
2. The other item categories + `getItemType` + hands + weight rules + ground items; plant and harvest start using real items
3. Containers: grids, rotation, nesting, allowed lists, clothing, attachments, coins
4. Save/load (`storage.js`)

## Still to settle
- **Later steps:** changing weather, irrigation, and the hand-watering action. All will use `addWater` or `state.weather`.
- **Before Step 3:** where a belt goes (a new `waist` spot, or on `legs`), and the shape of attachment spots. Not shown in the model above.
- **Before Step 4:** localStorage holds about 5 MB, and a chunk is now about 22 KB, so only around 200 chunks fit. `getTile` creates a chunk just by looking at it, so we should only save chunks that have changed.

## CLAUDE.md change
Add to Code style in `/Users/ionide/.claude/CLAUDE.md` (the global file only):

> Object properties always go on their own lines, even for small objects. Never write `{ a: 1, b: 2 }` on one line.

## Step 1: what gets built

With every property on its own line, the definitions alone are long, so they get their own file. The rest is split by job, so each file stays under roughly 150 lines.

| File | Why |
|---|---|
| `data/definitions.js` | The constants: `SOIL_TYPES`, `WEATHER_TYPES`, `ITEM_TYPES` (`seed` and `plant` only) |
| `data/world.js` | Chunks and tiles: creating them and finding them |
| `data/water.js` | Soil mix, water levels, rain and drying |
| `data/crops.js` | Tilling, planting, harvesting and growing |
| `data/sleep.js` | `updateWorldState`: what happens to the world when a day passes |
| `tests/testHelper.js` | A small `test(name, callback)` that logs pass/fail to the console |
| `tests/dataTests.js` | One small test per behaviour |
| `tests/tests.html` | Loads the tests in the browser |

Functions by file:

`data/world.js`, creating and finding:
- `getAllTiles(state)` → every tile in every chunk that exists
- `createSoil()`, `createTile()`, `createChunk()`, `createGameState()` (player is only `x`, `y`, `yaw`, `pitch` for now; `weather` starts as `"sunny"`)
- `getChunkKey(chunkX, chunkY)` → `"chunkX,chunkY"`
- `getTile(state, x, y)` → finds or creates the chunk, returns the tile. Uses `Math.floor(x / CHUNK_SIZE)` so negative coordinates land in the right chunk.

`data/water.js`, soil and water:
- `rainOnTiles(state)` → adds today's `rainPerDay` to every tile
- `dryTiles(state)` → takes away the daily loss (private helper: `getDailyWaterLoss`)
- `isValidSoil(soil)` → each amount is 0-10 and they add up to 10
- `setTileSoil(state, x, y, soil)` → `null` if the mix is not valid
- `getSoilDrainPerDay(soil)` → the weighted average
- `roundToOneDecimal(value)`, `limitWaterLevel(level)` → keeps a level between 0 and 10, one decimal
- `addWater(state, x, y, amount)` → new level; `null` if `amount` is not above 0 or the tile is type `water` (private helper: `addWaterToTile`)

`data/crops.js`, farming:
- `tillTile(state, x, y)` → grass becomes soil; `null` if not grass
- `plantCrop(state, x, y, seedName)` → needs soil, no crop, and a key that exists in `ITEM_TYPES.seed`; `null` otherwise (using up a seed comes in Step 2)
- `isCropReady(crop)` → boolean, compares `daysGrown` to the seed's `daysToGrow`
- `harvestCrop(state, x, y)` → clears the crop and returns its `harvestItem` name; `null` if not ready (goes to hands in Step 2)
- `getSoilGrowthRate(soil, seedType)` → 1, 0.5 or 0.25
- `isWaterInRange(waterLevel, seedType)` → boolean
- `growCrops(state)` → crops with water in range gain their growth rate

`data/sleep.js`:
- `updateWorldState(state)` → calls `rainOnTiles`, `growCrops`, `dryTiles` in that order. Nothing calls it yet; sleeping will.

New concepts to explain when written: ES modules (`export`/`import`), square-bracket lookups with a variable (`ITEM_TYPES.seed[seedName]`), `for...in` over chunks combined with nested loops, and `Math.floor`, `Math.round`, `Math.abs`, `Math.min`, `Math.max`.

## Verification
Open `tests/tests.html` through a local server (ES modules need one, such as VS Code Live Server) and read the browser console. Tests:

World:
- creates a 16 × 16 chunk of grass
- new tile is all loam
- getTile returns the same tile on repeat calls
- getTile puts negative coordinates in the right chunk
- tile (16, 0) lands in a different chunk from tile (15, 0)

Soil and water:
- accepts a mix that adds up to 10, rejects one that does not
- rejects an amount above 10 or below 0
- 7 sandy, 2 loam, 1 clay drains 1.6 per day
- addWater raises the level and never goes above 10
- addWater refuses a water tile and an amount of 0

Farming:
- tills grass, refuses to till water
- plants on soil, refuses a second crop, refuses an unknown seed
- harvest refuses an unready crop, clears a ready one and returns its item name

Each day:
- crop grows when water is in range
- crop does not grow below its minimum or above its maximum
- crop grows 1, 0.5 or 0.25 depending on the soil difference
- daily loss adds soil, crop and weather together
- water never drops below 0
- a tile with no crop skips crop water use
- rainy weather adds water before crops grow
- water tiles are not dried
