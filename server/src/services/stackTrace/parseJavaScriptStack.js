// Firefox/Safari frame format: "functionName@https://site.com/app.js:42:11"
// (Safari sometimes omits the function name entirely: "@app.js:10:3")
const BROWSER_FRAME_RE = /^([^@]*)@(.+):(\d+):(\d+)$/;
const HEADER_RE = /^([A-Za-z0-9_$]+(?:Error)?)\s*:\s*(.*)$/;

export function parseJavaScriptStack(rawStack) {
  if (!rawStack || typeof rawStack !== 'string') {
    return { errorName: 'Error', errorMessage: '', frames: [] };
  }

  const lines = rawStack.split('\n').map((l) => l.trim()).filter(Boolean);

  let errorName = 'Error';
  let errorMessage = '';
  const frames = [];

  for (const line of lines) {
    const frameMatch = line.match(BROWSER_FRAME_RE);
    if (frameMatch) {
      const [, functionName, filePath, lineNum, columnNum] = frameMatch;
      frames.push({
        functionName: functionName.trim() || '<anonymous>',
        fileName: filePath.split(/[\\/]/).pop().split('?')[0],
        filePath,
        line: parseInt(lineNum, 10),
        column: parseInt(columnNum, 10),
      });
      continue;
    }

    const headerMatch = line.match(HEADER_RE);
    if (headerMatch) {
      errorName = headerMatch[1];
      errorMessage = headerMatch[2];
    } else if (!errorMessage && !line.includes('@')) {
      errorMessage = line;
    }
  }

  return { errorName, errorMessage, frames };
}
