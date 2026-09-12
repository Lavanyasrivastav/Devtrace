import { describe, it, expect } from 'vitest';
import { generateFingerprint } from '../../src/services/errorFingerprint/generateFingerprint.js';

describe('generateFingerprint', () => {
  it('produces a 64-character SHA-256 hex digest', () => {
    const { fingerprint } = generateFingerprint({ message: 'Test error', stackTrace: '', service: 'api' });
    expect(fingerprint).toHaveLength(64);
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it('groups near-duplicate errors with different IDs into the same fingerprint', () => {
    const stackTrace = 'Error: User not found\n    at getUser (/app/src/userService.js:42:11)';
    const a = generateFingerprint({ message: 'User 111 not found', stackTrace, service: 'user-service' });
    const b = generateFingerprint({ message: 'User 999 not found', stackTrace, service: 'user-service' });
    expect(a.fingerprint).toBe(b.fingerprint);
  });

  it('produces different fingerprints for genuinely different errors', () => {
    const a = generateFingerprint({ message: 'Database connection failed', stackTrace: '', service: 'db' });
    const b = generateFingerprint({ message: 'Payment declined', stackTrace: '', service: 'payments' });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('produces different fingerprints for the same message in different services', () => {
    const a = generateFingerprint({ message: 'Timeout', stackTrace: '', service: 'service-a' });
    const b = generateFingerprint({ message: 'Timeout', stackTrace: '', service: 'service-b' });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('detects the error type from the message', () => {
    const { errorType } = generateFingerprint({ message: 'TypeError: x is not a function', stackTrace: '', service: 'api' });
    expect(errorType).toBe('TypeError');
  });

  it('defaults error type to "Error" when none is present', () => {
    const { errorType } = generateFingerprint({ message: 'something went wrong', stackTrace: '', service: 'api' });
    expect(errorType).toBe('Error');
  });
});
