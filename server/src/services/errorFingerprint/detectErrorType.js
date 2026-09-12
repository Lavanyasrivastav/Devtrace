// Matches "TypeError: Cannot read property..." style prefixes, which is how
// virtually every JS/Node error stringifies (Error.prototype.toString()).
const NAMED_ERROR_RE = /^([A-Z][A-Za-z0-9]*Error)\s*:/;

export function detectErrorType(message, stackTrace) {
  const fromMessage = message?.match(NAMED_ERROR_RE);
  if (fromMessage) return fromMessage[1];

  const firstLine = stackTrace?.split('\n')[0]?.trim();
  const fromStack = firstLine?.match(NAMED_ERROR_RE);
  if (fromStack) return fromStack[1];

  return 'Error';
}
