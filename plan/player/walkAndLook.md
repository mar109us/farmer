# Farm game: walk and look in first person

## Context
The first build draws one chunk from a still camera (see `plan/rendering/threeJsView.md`). This build makes it feel like a first-person game: click to capture the mouse, look around, and walk with WASD. Crops, more chunks, aiming and terrain height come later.

## Your decisions
| Topic | Decision |
|---|---|
| Player data | `x` and `y` can be decimals. `facing` is replaced by `yaw` and `pitch`, in radians |
| Mouse look | Hand-written, using the browser's pointer lock. It changes `player.yaw` and `player.pitch` |
| Walking | WASD follows where you face. 4 tiles per second, based on elapsed time |
| Start | `x: 8`, `y: 8`, `yaw: 0`, `pitch: 0`. The tilled patch is ahead and to the left |
| Chunk edge | No limit. You float over empty sky past the chunk until more chunks are drawn |
| Files | Maths in `data/player.js`, listeners in `input.js`, loop in `main.js` |

## Small choices for you to check
- **Logging:** `console.table(state.player)` when a key goes down or up and when the mouse is captured. Not on every mouse move or frame, because that would flood the console many times a second.
- **Diagonals:** W + D together is not faster than W alone.
- **Pitch limit:** you can look almost straight up or down (1.5 radians), but cannot flip over.
- **Time limit per frame:** a frame counts as at most 0.1 seconds. Without this, switching tabs and coming back would teleport the player.
- **Stuck keys:** if the window loses focus, all held keys are released, because the browser never reports those key releases.

## Do first
1. Add this line to "How to work with me" in `/Users/ionide/.claude/CLAUDE.md` (the global file only):
   > Whenever a plan is accepted, save it as a file in the project's `plan/` folder, in a subfolder named after what the plan revolves around, for example `plan/rendering/threeJsView.md`.
2. Sort the plans into folders by topic:
   - `plan/dataModel.md` moves to `plan/data/dataModel.md`
   - `plan/threeJsView.md` moves to `plan/rendering/threeJsView.md`
   - this plan is saved as `plan/player/walkAndLook.md`

## What gets built
| File | Change | Why |
|---|---|---|
| `data/definitions.js` | Edit | Add `WALK_SPEED`, `MAX_PITCH`, `MOUSE_SENSITIVITY` with your other constants |
| `data/world.js` | Edit | New player fields in `createGameState` |
| `data/player.js` | New | The maths that changes the player. No browser code, so it can be tested |
| `input.js` | New | Listens to keyboard and mouse, remembers which keys are held |
| `view/scene.js` | Edit | Split `renderWorld` into set up once, and draw each frame. The camera reads `yaw` and `pitch` instead of `lookAt` |
| `main.js` | Edit | Runs the animation loop |
| `tests/playerTests.js` | New | Tests for `data/player.js` |
| `tests/tests.html` | Edit | Loads the new tests |
| `plan/data/dataModel.md` | Edit | Lines 353, 444 and 481 still describe `facing` and whole-number positions |

`data/player.js` (each takes `state`, like your other data functions):
- `limitPitch(pitch)`: keeps it between `-MAX_PITCH` and `MAX_PITCH`
- `turnPlayer(state, mouseMovementX, mouseMovementY)`: changes `yaw` and `pitch`
- `getWalkInput(keysHeld)`: turns held keys into `forward` and `sideways`, each -1, 0 or 1
- `movePlayer(state, walkInput, seconds)`: uses `Math.sin` and `Math.cos` of `yaw` to move `x` and `y`. Returns early if no key is held

`input.js`:
- `keysHeld`: an object such as `KeyW: true`
- `handleKeyDown(event, state)`, `handleKeyUp(event, state)`, `handleMouseMove(event, state, canvas)`, `releaseAllKeys()`
- `listenForInput(state, canvas)`: attaches the listeners, and a click on the canvas captures the mouse

`view/scene.js`:
- `createWorldView(state)`: replaces `renderWorld`. Builds the scene once and returns an object with `scene`, `camera` and `renderer`
- `updateCamera(camera, player)`: position plus `rotation.set(pitch, yaw, 0)`, with rotation order `"YXZ"`, so turning happens before tilting and the horizon stays level
- `drawFrame(view, player)`: updates the camera and renders

`main.js`:
- `getWalkInput` and `movePlayer` run each frame inside a `gameLoop` that calls `requestAnimationFrame`
- `getSecondsSinceLastFrame` applies the 0.1 second limit

New concepts I'll explain when written: `addEventListener`, closures (a callback remembering `state`), pointer lock, `requestAnimationFrame`, `Math.sin` and `Math.cos` for direction, `event.code`.

## Tests in `tests/playerTests.js`
Uses your `test`, `expectEqual` and `logTestSummary`, and your existing `roundToOneDecimal` from `data/water.js` where `Math.sin` gives long decimals.

- player starts in the middle of the chunk, looking straight ahead
- moving the mouse right lowers yaw
- moving the mouse up raises pitch
- pitch stops at the upper limit, and at the lower limit
- W at yaw 0 moves toward lower y
- S at yaw 0 moves toward higher y
- D at yaw 0 moves toward higher x
- half a second moves half as far
- W + D together moves the same distance as W alone
- no keys held does not move the player
- W + S together cancel out

## Verification
- Open `tests/tests.html` and read the console. The last summary line is the total for both test files.
- Open `main.html` through Live Server. You start mid-field with the brown patch ahead and to the left.
- Click the game: the cursor disappears and the mouse turns your view. You cannot flip over. Esc releases the mouse.
- WASD walks where you face, at the same speed diagonally. `console.table` shows the player when a key changes.
- Walk off the edge: you float over sky, with no errors.
