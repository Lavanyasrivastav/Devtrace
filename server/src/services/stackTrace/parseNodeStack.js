// Node/V8 frame formats:
//   "    at functionName (/path/to/file.js:42:11)"
//   "    at Object.<anonymous> (/path/to/file.js:10:5)"
//   "    at /path/to/file.js:8:3"                        (anonymous, no function name)
//   "    at async functionName (/path/to/file.js:20:1)"  (async frames)
const NODE_FRAME_RE = /^\s*at\s+(?:async\s+)?(?:([^(]+)\s+\()?([^():]+):(\d+):(\d+)\)?$/;
const HEADER_RE = /^([A-Za-z0-9_$]+(?:Error)?)\s*:\s*(.*)$/;

export function parseNodeStack(rawStack) {
  if (!rawStack || typeof rawStack !== 'string') {
    return { errorName: 'Error', errorMessage: '', frames: [] };
  }

  const lines = rawStack.split('\n').map((l) => l.trim()).filter(Boolean);

  let errorName = 'Error';
  let errorMessage = '';
  const frames = [];

  for (const line of lines) {
    if (!line.startsWith('at ')) {
      // First non-frame line is the "ErrorName: message" header.
      const headerMatch = line.match(HEADER_RE);
      if (headerMatch) {
        errorName = headerMatch[1];
        errorMessage = headerMatch[2];
      } else if (!errorMessage) {
        errorMessage = line;
      }
      continue;
    }

    const frameMatch = line.match(NODE_FRAME_RE);
    if (frameMatch) {
      const [, functionName, filePath, lineNum, columnNum] = frameMatch;
      frames.push({
        functionName: functionName ? functionName.trim() : '<anonymous>',
        fileName: filePath.split(/[\\/]/).pop(),
        filePath,
        line: parseInt(lineNum, 10),
        column: parseInt(columnNum, 10),
      });
    }
  }

  return { errorName, errorMessage, frames };
}
