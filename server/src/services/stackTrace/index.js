import { parseNodeStack } from './parseNodeStack.js';
import { parseJavaScriptStack } from './parseJavaScriptStack.js';

// Add new parsers here as DevTrace grows to support other languages
// (e.g. Python tracebacks, Java stack traces) — each parser must return
// { errorName, errorMessage, frames: [{ functionName, fileName, filePath, line, column }] }
const PARSERS = [
  { name: 'node', test: (stack) => /\n?\s*at\s.+:\d+:\d+/.test(stack), parse: parseNodeStack },
  { name: 'browser', test: (stack) => /@.+:\d+:\d+/.test(stack), parse: parseJavaScriptStack },
];

export function parseStackTrace(rawStack) {
  if (!rawStack || typeof rawStack !== 'string' || !rawStack.trim()) {
    return { format: 'unknown', errorName: 'Error', errorMessage: '', frames: [] };
  }

  for (const parser of PARSERS) {
    if (parser.test(rawStack)) {
      return { format: parser.name, ...parser.parse(rawStack) };
    }
  }

  return { format: 'unknown', errorName: 'Error', errorMessage: rawStack.split('\n')[0], frames: [] };
}
