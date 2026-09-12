// Order matters: more specific patterns must run before more general ones,
// otherwise (e.g.) a UUID would get partially eaten by the plain-number regex
// before the UUID regex ever sees it.
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[a-z.]{2,}\b/gi;
const ISO_DATE_RE = /\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?\b/g;
const HEX_ID_RE = /\b0x[0-9a-f]+\b/gi;
const MONGO_OBJECTID_RE = /\b[0-9a-f]{24}\b/gi;
const NUMBER_RE = /\b\d+(\.\d+)?\b/g;
const QUOTED_STRING_RE = /(['"])(?:(?!\1).)*\1/g;

export function normalizeMessage(rawMessage) {
  if (!rawMessage) return '';

  return rawMessage
    .trim()
    .replace(UUID_RE, '<uuid>')
    .replace(EMAIL_RE, '<email>')
    .replace(ISO_DATE_RE, '<date>')
    .replace(HEX_ID_RE, '<hex>')
    .replace(MONGO_OBJECTID_RE, '<id>')
    .replace(QUOTED_STRING_RE, '<value>')
    .replace(NUMBER_RE, '<num>')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
