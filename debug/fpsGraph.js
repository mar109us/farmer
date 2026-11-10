const MAX_HISTORY_LENGTH = 40;
const GRAPH_HEIGHT_PIXELS = 40;

export function addToHistory(history, framesPerSecond) {
  history.push(framesPerSecond);
  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift();
  }
}

export function findHighest(history) {
  let highest = 0;
  for (const framesPerSecond of history) {
    if (framesPerSecond > highest) {
      highest = framesPerSecond;
    }
  }
  return highest;
}

export function getBarHeight(framesPerSecond, highestFramesPerSecond) {
  if (highestFramesPerSecond === 0) {
    return 0;
  }
  const fractionOfHighest = framesPerSecond / highestFramesPerSecond;
  return Math.round(fractionOfHighest * GRAPH_HEIGHT_PIXELS);
}

export function buildGraphHtml(history) {
  const highestFramesPerSecond = findHighest(history);
  let graphHtml = "";
  for (const framesPerSecond of history) {
    const height = getBarHeight(framesPerSecond, highestFramesPerSecond);
    graphHtml = `${graphHtml}<div class="debugBar" style="height: ${height}px"></div>`;
  }
  return graphHtml;
}
