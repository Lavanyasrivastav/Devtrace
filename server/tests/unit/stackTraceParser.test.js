import { describe, it, expect } from 'vitest';
import { parseStackTrace } from '../../src/services/stackTrace/index.js';

describe('parseStackTrace', () => {
  it('parses a standard Node.js stack trace', () => {
    const stack = [
      "TypeError: Cannot read properties of undefined (reading 'id')",
      '    at getUser (/app/src/services/userService.js:42:11)',
      '    at async handleRequest (/app/src/controllers/userController.js:15:3)',
    ].join('\n');

    const result = parseStackTrace(stack);

    expect(result.format).toBe('node');
    expect(result.errorName).toBe('TypeError');
    expect(result.frames).toHaveLength(2);
    expect(result.frames[0]).toMatchObject({ functionName: 'getUser', fileName: 'userService.js', line: 42, column: 11 });
    expect(result.frames[1].functionName).toBe('handleRequest');
  });

  it('parses an anonymous Node frame with no function name', () => {
    const stack = 'Error: boom\n    at /app/src/app.js:88:5';
    const result = parseStackTrace(stack);
    expect(result.frames[0].fileName).toBe('app.js');
    expect(result.frames[0].functionName).toBe('<anonymous>');
  });

  it('parses a Firefox/Safari-style browser stack trace', () => {
    const stack = 'ReferenceError: x is not defined\nhandleClick@https://example.com/app.js:120:9';
    const result = parseStackTrace(stack);
    expect(result.format).toBe('browser');
    expect(result.frames[0]).toMatchObject({ functionName: 'handleClick', fileName: 'app.js', line: 120, column: 9 });
  });

  it('returns an empty frame list for an empty or missing stack trace', () => {
    expect(parseStackTrace('').frames).toEqual([]);
    expect(parseStackTrace(null).frames).toEqual([]);
    expect(parseStackTrace(undefined).format).toBe('unknown');
  });

  it('strips query strings from browser file names', () => {
    const stack = 'Error: x\nfoo@https://cdn.example.com/bundle.js?v=123:10:2';
    const result = parseStackTrace(stack);
    expect(result.frames[0].fileName).toBe('bundle.js');
  });
});
