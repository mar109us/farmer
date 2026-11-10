# Debug panel: position and chunk blocks

## Context

The debug panel changes width as the player walks. It has no set width, so it is as wide as its longest line, and that line is `Position: 8.0, 8.0 (chunk 0,0)`, which gets longer and shorter as the numbers change.

Splitting position and chunk onto short lines fixes this too. The FPS graph has a fixed width of 159px, and it becomes the widest thing in the panel, so the width stops changing. No CSS change is needed.

## Decisions

| Decision | Choice |
| --- | --- |
| z value | New `z: 0` field on the player, meaning feet height |
| Placement | Blocks at the bottom, after the performance stats |
| Decimals | Position keeps one decimal, chunk is whole numbers |

## Target text

```
FPS: 60
Chunks loaded: 1
Draw calls: 256
Triangles: 3072

position
x: 8.0
y: 8.0
z: 0.0

chunk
x: 0
y: 0
```

Blank lines show up because the panel uses `white-space: pre-line`, which keeps line breaks.

## Files

| File | Change | Why |
| --- | --- | --- |
| `data/world.js` | Add `z: 0` to `player` in `createGameState` | The panel shows real game data, not a made-up 0 |
| `debug/debugPanel.js` | New text helpers, new layout in `buildStatsText` | The display change |
| `tests/debugPanelTests.js` | Update expected text, replace the chunk tests | Tests must match the new layout |
| `plan/debug/positionDisplay.md` | New, copy of this plan | Your rule for accepted plans |

## debugPanel.js details

- Replace `getChunkKeyAt(x, y)` with `getChunkCoordinate(position)`, which returns `Math.floor(position / CHUNK_SIZE)`. The panel now needs chunk x and y as separate numbers, not the text `"0,0"`, and only the panel and its tests use `getChunkKeyAt`.
- Remove the `getChunkKey` import from `data/world.js`, since nothing in this file uses it any more.
- New `buildPositionText(player)`: the `position` block, using `toFixed(1)`.
- New `buildChunkText(player)`: the `chunk` block, using `getChunkCoordinate`.
- `buildStatsText` joins the four stat lines and both blocks with a template literal. It no longer calculates position or chunk itself.

## Tests

- "getChunkCoordinate finds the chunk for a decimal position": `8.5` gives `0`, `16.5` gives `1`.
- "getChunkCoordinate puts negative positions in the right chunk": `-0.5` gives `-1`.
- "builds the stats text from the state and renderer": expected text becomes the layout above.

## Verification

1. Open `tests/tests.html` and check the browser console shows every test passing.
2. Open `main.html` and walk around, including past tile 16 and into negative positions.
3. The panel width and height should stay the same, the numbers should update, and chunk x should change from `0` to `1` when crossing tile 16.
