# Debug panel: live stats in the top left corner

## Context
You want to see how the game is performing while you build it. The panel goes on top of the 3D canvas and shows FPS, chunks loaded, player position and three.js draw stats. All debug code stays out of the game, so removing it is simple.

## Decisions
| Topic | Decision | Why |
|---|---|---|
| Stats | FPS, chunks loaded, player position with current chunk, draw calls, triangles | Your choice |
| Refresh | Twice a second | Readable digits, and FPS is a true average over that half second |
| Visibility | Always visible | Least code. A toggle key can come later |
| Dependency | None, we write it ourselves | FPS is a few lines, and three.js already counts draw calls and triangles in `renderer.info` |
| Separation | Everything lives in `debug/`, connected by two lines in `main.js` | You don't want debug code ingrained with the game |

## What gets built
| File | Change | Why |
|---|---|---|
| `debug/debugPanel.js` | New | All the debug logic: stats, frame counting, the panel element and its own loop |
| `debug/debugPanel.css` | New | Fixed to the top left, dark background, monospace, `white-space: pre-line` so `\n` makes new lines, and `pointer-events: none` so clicks reach the canvas and still lock the mouse |
| `main.js` | One import, and one `startDebugPanel(state, view.renderer)` line in `startGame` | The only connection to the game. `gameLoop` doesn't know the panel exists |
| `tests/debugPanelTests.js` | New | Tests stay in `tests/` |
| `tests/tests.html` | Add a script line for the new test file | Your test page lists each test file |

`main.html`, `style.css` and `data/world.js` are not changed.

## `debug/debugPanel.js`, one job per function
- `getChunkKeyAt(x, y)`: the chunk key for a position. Reuses `getChunkKey`.
- `countChunks(state)`: how many chunks exist.
- `calculateFramesPerSecond(frameCount, milliseconds)`: the FPS maths, rounded to a whole number.
- `buildStatsText(framesPerSecond, state, renderer)`: returns the panel's text.
- `addStylesheet()`: adds the `<link>` for `debug/debugPanel.css` to the page.
- `createPanelElement()`: creates the `<aside>` and adds it to the page.
- `createDebugPanel()`: returns an object with `element`, `framesCounted` and `lastRefreshTime`.
- `updateDebugPanel(panel, currentTime, state, renderer)`: adds one frame, returns early if half a second has not passed, otherwise writes the text and resets the counter.
- `startDebugPanel(state, renderer)`: sets up the panel and runs its own `requestAnimationFrame` loop.

The panel shows:
```
FPS: 60
Chunks loaded: 1
Position: 8.0, 8.0 (chunk 0,0)
Draw calls: 256
Triangles: 3072
```

## Details that matter
- A separate loop still reads correct numbers, because three.js keeps `renderer.info` until the next render, and both loops run once per browser frame.
- FPS uses the real `currentTime` from `requestAnimationFrame`.
- `countChunks` reads `state.chunks` with `for...in`. It must not call `getTile`, because `getTile` creates missing chunks.
- `textContent` writes the text, so no HTML is built.
- `debug/debugPanel.js` must not import three.js. It only reads `renderer` as an argument, so the test page can import it without an import map.
- `STYLESHEET_PATH` is relative to `main.html`, because a `<link>` resolves against the page, not the script.

## How to remove it
1. Delete the `debug/` folder.
2. In `main.js`, delete the `startDebugPanel` import and its call.
3. Delete `tests/debugPanelTests.js` and its script line in `tests/tests.html`.

## Tests (`tests/debugPanelTests.js`)
- "counts zero chunks in a new game"
- "counts each chunk once"
- "getChunkKeyAt finds the chunk for a decimal position"
- "getChunkKeyAt puts negative positions in the right chunk"
- "calculates 60 frames per second from 30 frames in 500 milliseconds"
- "builds the stats text from the state and renderer": passes a plain object shaped like `renderer.info`, because a real renderer needs a canvas and WebGL.

## Suggested, not part of this change
`getTile` works out the chunk with the same `Math.floor` maths as `getChunkKeyAt`. When several chunks are drawn, the game may need that function too, and it could move into `data/world.js` then.

## Verification
- Open `main.html` through Live Server. Expect the panel in the top left with about your monitor's refresh rate as FPS, 1 chunk, 256 draw calls and 3072 triangles.
- Walk across the field. Position should change and the chunk should stay `0,0` until you step past tile 16, where it changes to `1,0` while chunks loaded stays 1.
- Click on the panel itself and confirm the mouse still locks.
- Open `tests/tests.html` and confirm all tests pass in the console.
