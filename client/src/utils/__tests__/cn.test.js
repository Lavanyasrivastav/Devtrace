import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('joins truthy class names with spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c');
  });

  it('supports conditional object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});
