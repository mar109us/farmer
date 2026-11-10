# Debug panel: 20 second FPS graph

## Context
You want to see performance over time in the debug panel, not just the current number. The panel gets a small bar graph of average FPS. It stays inside `debug/`, so `main.js` and the game loop do not change.

## Decisions
| Topic | Decision | Why |
|---|---|---|
| Value graphed | Average FPS, per half second | Your choice, and the panel already calculates it |
| Drawing | One `div` per bar, set with `innerHTML`, lined up with flexbox | Techniques you already know, and each bar can be inspected in devtools |
| History | 20 seconds = 40 bars | Your choice. One bar per panel refresh |
| Full-height bar | The highest FPS in the current history, 0 FPS is empty | Works on any screen, since the game runs at the monitor's refresh rate |
| Dependency | None | |

## What gets built
| File | Change | Why |
|---|---|---|
| `debug/fpsGraph.js` | New | The graph has one job, so it gets its own file and `debugPanel.js` stays short |
| `debug/debugPanel.js` | Add a text element and a graph element inside the panel, keep the history, draw the graph on each refresh | See "Details that matter" |
| `debug/debugPanel.css` | Add `.debugGraph` and `.debugBar` | Layout and look of the bars |
| `tests/debugPanelTests.js` | Add the graph tests | The graph is part of the panel, and `tests.html` needs no change this way |

`main.js`, `main.html` and the game code are not changed.

## `debug/fpsGraph.js`, one job per function
- `addToHistory(history, framesPerSecond)`: adds the newest value and removes the oldest once there are more than 40.
- `findHighest(history)`: the largest value, using a `for...of` loop. Returns 0 for an empty history.
- `getBarHeight(framesPerSecond, highestFramesPerSecond)`: the bar height in whole pixels, out of 40. Returns 0 when the highest value is 0, to avoid dividing by zero.
- `buildGraphHtml(history)`: returns one `<div class="debugBar" style="height: ...px"></div>` per value.

## `debug/debugPanel.js` changes
- New helper `createChildElement(parent, className)`: creates a `div` inside the panel. The panel's two children are plain `div`s because no semantic element describes them better.
- `createDebugPanel()` also returns `textElement`, `graphElement` and `framesPerSecondHistory` (starts as `[]`).
- `updateDebugPanel()` writes the stats to `panel.textElement`, calls `addToHistory`, then sets `panel.graphElement.innerHTML = buildGraphHtml(...)`.

## `debug/debugPanel.css` additions
- `.debugGraph`: `display: flex`, `align-items: flex-end` so bars grow up from the bottom, `justify-content: flex-end` so the newest bar is always on the right, `gap: 1px`, `width: 159px`, `height: 40px`, `margin-top: 8px`.
- `.debugBar`: `width: 3px`, `flex-shrink: 0`, and a green background color.

## Details that matter
- Text and graph need separate elements. `updateDebugPanel` currently sets `textContent` on the whole panel, which would erase the graph on every refresh.
- `innerHTML` is safe here because the bars contain only numbers calculated by the game, never user input.
- The graph has a fixed width so the panel does not grow as the first 40 bars arrive.
- `fpsGraph.js` must not import three.js, so the test page can still import it.

## How to remove it
Delete `debug/fpsGraph.js`, then undo the panel and CSS additions and delete the graph tests. To remove the whole panel, the existing steps in `plan/debug/debugPanel.md` still apply.

## Tests (`tests/debugPanelTests.js`)
- "adds a value to the history"
- "keeps only the newest 40 values"
- "finds the highest value in the history"
- "finds 0 as the highest value of an empty history"
- "gives the highest value a full height bar"
- "gives half the highest value a half height bar"
- "gives a zero height bar when the highest value is 0"
- "builds one bar for each value"

## Verification
- Open `main.html` through Live Server. Bars should appear on the right of the graph, one every half second, and scroll left.
- After 20 seconds there should be exactly 40 bars, which you can count under `.debugGraph` in devtools.
- Create a dip by switching tabs briefly, or by dragging the window. A shorter bar should appear and scroll away after 20 seconds.
- The stats text should keep updating, and clicking on the panel should still lock the mouse.
- Open `tests/tests.html` and confirm all tests pass in the console.
