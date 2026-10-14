import { normalize } from '../src/utils/normalise';
import { describe, expect, test } from 'vitest';

describe('normalise utility', () => {
  test('maps value to 0‑1 range', () => {
    expect(normalize(5, 0, 10)).toBeCloseTo(0.5);
    expect(normalize(0, 0, 10)).toBe(0);
    expect(normalize(10, 0, 10)).toBe(1);
  });
});
