import { lngLatToXZ } from '../src/utils/projection';

import { describe, expect, test } from 'vitest';

describe('projection utility', () => {
  test('scales coordinates by 0.1 factor', () => {
    const [x, z] = lngLatToXZ([40, 5]);
    expect(x).toBeCloseTo(4);
    expect(z).toBeCloseTo(0.5);
  });
});
