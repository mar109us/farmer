# Farm game: draw the world in 3D with three.js

## Context
You want the game in 3D. `plan/dataModel.md` says Canvas 2D, and nothing is drawn yet. three.js is the best fit: raw WebGL means writing shaders first, and Babylon.js is a bigger engine than a tile farm needs.

`data/` has no drawing code, so the rules and their tests stay as they are. This first step only proves the connection: your real tile data shows up as 3D boxes.

## Decisions for you to check
| Topic | Decision | Why |
|---|---|---|
| Dependency | three.js, an exact pinned version (0.170.0) | CLAUDE.md asks me to ask first, so approving this plan is your yes |
| Loading it | An import map in `main.html`, pointing at the jsDelivr CDN | One block of HTML. No npm, no `node_modules`, no build step. Needs internet to run |
| Camera | First-person, at eye height (1.6 tiles) at `state.player`. In Step 1 it stands still, looking at the middle of the chunk | Your choice. Mouse look and walking are the next step, because they need a change to your player data |
| Ground | Flat for now, each tile is a thin box. Height comes later | Your tiles have no height value yet. The box's position will be the one place that changes when they do |
| Coordinates | The centre of tile `(x, y)` sits at three.js `(x + 0.5, 0, y + 0.5)` | In three.js, `y` means up. The 0.5 makes the tile under the player `Math.floor(player.x)`, the same rounding `getTile` uses |

## Do first
1. Add this line to "How to work with me" in `/Users/ionide/.claude/CLAUDE.md` (the global file only):
   > Walk me through a plan one decision at a time, asking about each, before showing me the whole plan.
2. Save this plan as a new file, `plan/threeJsView.md`, next to `plan/dataModel.md`.

## Step 1: what gets built
| File | Change | Why |
|---|---|---|
| `main.html` | New | Import map, `<main>` to hold the 3D canvas, loads `main.js` |
| `style.css` | New | Removes the page margin so the canvas fills the window |
| `main.js` | New | Creates the state with `createGameState`, tills a few tiles with `tillTile` so two colours show, calls the view |
| `view/scene.js` | New | Scene, camera, lights, renderer, and the call that renders once |
| `view/tiles.js` | New | Tile colours and one plain coloured box per tile |
| `plan/dataModel.md` | Edit line 4 | Replace "3/4 top-down, drawn with Canvas 2D" with first-person 3D, drawn with three.js |

`view/scene.js` functions, one job each:
- `createScene()` (with a sky colour), `createCamera(player)`, `addLights(scene)`, `createRenderer()`
- `renderWorld(state)`: calls the above and `drawChunk`, then renders once

`view/tiles.js` functions, one job each:
- `getTileColor(tile)`: looks up the colour for `grass`, `soil`, `water` or `path`
- `createTileMesh(tile, x, y)`: one box in the right place
- `drawChunk(scene, state)`: loops 0 to `CHUNK_SIZE - 1` in both directions, using `getTile` so your access rule holds

Kept simple on purpose:
- No animation loop yet, because nothing moves.
- 256 separate meshes is fine for one chunk. `InstancedMesh` comes with multiple chunks.
- `getTile` creating a chunk is harmless here, because only chunk `0,0` is drawn.

New concepts I'll explain when written: import maps, `new` and using a class (you won't write any), scene, camera and renderer, `position.set`.

## Later steps, each with its own plan
1. Walk and look: change the player data so `x` and `y` can be decimals, and replace `facing` with `yaw` (turning left and right) and `pitch` (looking up and down). Add mouse look, WASD, the animation loop, and tests for the new player data.
2. Draw crops as meshes that grow with `daysGrown`.
3. Several chunks around the player, using `InstancedMesh`. Add a read-only tile lookup first, so drawing doesn't create chunks and fill the save.
4. Aim and act: a crosshair and a raycast from the middle of the screen, with a reach limit, to till, plant and harvest the tile you look at.
5. Terrain height: add a height value to tiles, and make the camera follow the ground.

The data model steps (items, containers, save/load) don't depend on these.

## Verification
- Open `main.html` through a local server such as Live Server, because ES modules need one.
- Expect to stand at the corner of a 16 × 16 green field at eye level, under a sky colour, with the tilled tiles in brown and no errors in the console.
- Open `tests/tests.html` and confirm the existing data tests still pass.
