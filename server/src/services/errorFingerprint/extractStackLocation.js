import { parseStackTrace } from '../stackTrace/index.js';

// Delegates to the real stack trace parser (Phase 7) instead of maintaining
// a separate regex. Returns just the top frame's "file:line" for hashing.
export function extractTopFrameLocation(stackTrace) {
  const { frames } = parseStackTrace(stackTrace);
  if (!frames.length) return '';

  const top = frames[0];
  return `${top.fileName}:${top.line}`;
}
