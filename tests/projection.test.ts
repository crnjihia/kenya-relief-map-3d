import { describe, expect, test } from 'vitest';
import { lngLatToXZ, xzToLngLat, KENYA_CENTER, KENYA_BBOX, DEFAULT_MAP_SCALE } from '../src/utils/projection';

describe('projection utility', () => {
  test('has standard DEFAULT_MAP_SCALE of 2.5', () => {
    expect(DEFAULT_MAP_SCALE).toBe(2.5);
  });

  test('centers Kenya coordinates near [0, 0]', () => {
    const [x, z] = lngLatToXZ([KENYA_CENTER.lng, KENYA_CENTER.lat]);
    expect(x).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  test('projects Nairobi coordinates (approx 36.82 E, 1.29 S) correctly', () => {
    // Nairobi: lng 36.8219 (West of center 37.9), lat -1.2921 (South of center -0.05)
    const [x, z] = lngLatToXZ([36.8219, -1.2921]);
    expect(x).toBeLessThan(0); // West of center -> negative X
    expect(z).toBeGreaterThan(0); // South of center -> positive Z
  });

  test('projects Mandera (far North-East) into positive X and negative Z', () => {
    // Mandera: lng 41.86, lat 3.93
    const [x, z] = lngLatToXZ([41.86, 3.93]);
    expect(x).toBeGreaterThan(0); // East -> +X
    expect(z).toBeLessThan(0); // North -> -Z
  });

  test('respects custom scale option', () => {
    const [x1] = lngLatToXZ([39.9, 0], { scale: 1 });
    const [x2] = lngLatToXZ([39.9, 0], { scale: 2 });
    expect(x2).toBeCloseTo(x1 * 2);
  });

  test('performs round-trip inverse projection', () => {
    const original: [number, number] = [38.5, -2.1];
    const [x, z] = lngLatToXZ(original);
    const [lng, lat] = xzToLngLat([x, z]);
    expect(lng).toBeCloseTo(original[0], 4);
    expect(lat).toBeCloseTo(original[1], 4);
  });

  test('keeps all Kenya bounding box coordinates within expected world bounds', () => {
    const [minX, southZ] = lngLatToXZ([KENYA_BBOX.minLng, KENYA_BBOX.minLat]);
    const [maxX, northZ] = lngLatToXZ([KENYA_BBOX.maxLng, KENYA_BBOX.maxLat]);
    
    // Bounds check with scale 2.5
    expect(minX).toBeGreaterThanOrEqual(-15);
    expect(maxX).toBeLessThanOrEqual(15);
    expect(northZ).toBeGreaterThanOrEqual(-15);
    expect(southZ).toBeLessThanOrEqual(15);
  });
});
