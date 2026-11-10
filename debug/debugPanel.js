import { CHUNK_SIZE } from "../data/definitions.js";
import { getChunkKey } from "../data/world.js";
import { addToHistory, buildGraphHtml } from "./fpsGraph.js";

const REFRESH_MILLISECONDS = 500;
const STYLESHEET_PATH = "debug/debugPanel.css";

export function getChunkKeyAt(x, y) {
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkY = Math.floor(y / CHUNK_SIZE);
  return getChunkKey(chunkX, chunkY);
}

export function countChunks(state) {
  let chunkCount = 0;
  for (const chunkKey in state.chunks) {
    chunkCount = chunkCount + 1;
  }
  return chunkCount;
}

export function calculateFramesPerSecond(frameCount, milliseconds) {
  return Math.round((frameCount / milliseconds) * 1000);
}

export function buildStatsText(framesPerSecond, state, renderer) {
  const player = state.player;
  const renderInfo = renderer.info.render;
  const chunkKey = getChunkKeyAt(player.x, player.y);
  const position = `${player.x.toFixed(1)}, ${player.y.toFixed(1)}`;

  return `FPS: ${framesPerSecond}
Chunks loaded: ${countChunks(state)}
Position: ${position} (chunk ${chunkKey})
Draw calls: ${renderInfo.calls}
Triangles: ${renderInfo.triangles}`;
}

function addStylesheet() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLESHEET_PATH;
  document.head.appendChild(link);
}

function createPanelElement() {
  const element = document.createElement("aside");
  element.id = "debugPanel";
  document.body.appendChild(element);
  return element;
}

function createChildElement(parent, className) {
  const element = document.createElement("div");
  element.className = className;
  parent.appendChild(element);
  return element;
}

function createDebugPanel() {
  const element = createPanelElement();
  return {
    element: element,
    textElement: createChildElement(element, "debugText"),
    graphElement: createChildElement(element, "debugGraph"),
    framesPerSecondHistory: [],
    framesCounted: 0,
    lastRefreshTime: performance.now(),
  };
}

function updateDebugPanel(panel, currentTime, state, renderer) {
  panel.framesCounted = panel.framesCounted + 1;

  const elapsedMilliseconds = currentTime - panel.lastRefreshTime;
  if (elapsedMilliseconds < REFRESH_MILLISECONDS) {
    return;
  }

  const framesPerSecond = calculateFramesPerSecond(
    panel.framesCounted,
    elapsedMilliseconds,
  );
  panel.textElement.textContent = buildStatsText(
    framesPerSecond,
    state,
    renderer,
  );
  addToHistory(panel.framesPerSecondHistory, framesPerSecond);
  panel.graphElement.innerHTML = buildGraphHtml(panel.framesPerSecondHistory);
  panel.framesCounted = 0;
  panel.lastRefreshTime = currentTime;
}

export function startDebugPanel(state, renderer) {
  addStylesheet();
  const panel = createDebugPanel();

  function debugLoop(currentTime) {
    updateDebugPanel(panel, currentTime, state, renderer);
    requestAnimationFrame(debugLoop);
  }

  requestAnimationFrame(debugLoop);
}
