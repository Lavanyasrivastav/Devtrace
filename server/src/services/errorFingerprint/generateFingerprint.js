import crypto from 'crypto';
import { normalizeMessage } from './normalizeMessage.js';
import { extractTopFrameLocation } from './extractStackLocation.js';
import { detectErrorType } from './detectErrorType.js';

// Fingerprint = SHA-256 of (errorType | normalizedMessage | stackLocation | service).
// This is what makes "User 123 not found" and "User 456 not found" collapse
// into the same ErrorGroup: normalizeMessage() strips the "123"/"456" before
// hashing, so the two messages produce an identical fingerprint.
export function generateFingerprint({ message, stackTrace, service }) {
  const errorType = detectErrorType(message, stackTrace);
  const normalizedMessage = normalizeMessage(message);
  const location = extractTopFrameLocation(stackTrace);

  const raw = `${errorType}|${normalizedMessage}|${location}|${service}`;
  const fingerprint = crypto.createHash('sha256').update(raw).digest('hex');

  return { fingerprint, errorType, normalizedMessage, location };
}
