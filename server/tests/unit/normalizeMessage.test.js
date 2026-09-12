import { describe, it, expect } from 'vitest';
import { normalizeMessage } from '../../src/services/errorFingerprint/normalizeMessage.js';

describe('normalizeMessage', () => {
  it('replaces numeric IDs so similar messages match', () => {
    expect(normalizeMessage('User 123 not found')).toBe(normalizeMessage('User 456 not found'));
  });

  it('replaces UUIDs', () => {
    const result = normalizeMessage('Session 550e8400-e29b-41d4-a716-446655440000 expired');
    expect(result).toContain('<uuid>');
    expect(result).not.toContain('550e8400');
  });

  it('replaces email addresses', () => {
    const result = normalizeMessage('Failed to send to alice@example.com');
    expect(result).toContain('<email>');
  });

  it('replaces Mongo ObjectIds', () => {
    const result = normalizeMessage('Document 507f1f77bcf86cd799439011 not found');
    expect(result).toContain('<id>');
  });

  it('lowercases and collapses whitespace', () => {
    expect(normalizeMessage('  Multiple   Spaces   HERE  ')).toBe('multiple spaces here');
  });

  it('returns an empty string for falsy input', () => {
    expect(normalizeMessage('')).toBe('');
    expect(normalizeMessage(null)).toBe('');
  });

  it('does not collapse genuinely different messages', () => {
    expect(normalizeMessage('Payment declined')).not.toBe(normalizeMessage('User not found'));
  });
});
