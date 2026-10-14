import { describe, expect, test } from 'vitest';
import { normalize, normalizeScaled, formatMetricValue } from '../src/utils/normalise';

describe('normalise utility', () => {
  test('maps value to 0-1 range', () => {
    expect(normalize(5, 0, 10)).toBeCloseTo(0.5);
    expect(normalize(0, 0, 10)).toBe(0);
    expect(normalize(10, 0, 10)).toBe(1);
  });

  test('handles zero or negative span safely without NaN or Infinity', () => {
    expect(normalize(5, 10, 10)).toBe(0);
    expect(normalize(5, 10, 5)).toBe(0);
  });

  test('clamps values exceeding range bounds', () => {
    expect(normalize(15, 0, 10)).toBe(1);
    expect(normalize(-5, 0, 10)).toBe(0);
  });

  test('maps to custom target range', () => {
    expect(normalize(5, 0, 10, 0.2, 2.0)).toBeCloseTo(1.1);
  });

  test('normaliseScaled applies power curve correctly', () => {
    // Sqrt curve (exponent 0.5): 0.25 -> sqrt(0.25) = 0.5
    const val = normalizeScaled(2.5, 0, 10, 0.5, 0, 1);
    expect(val).toBeCloseTo(Math.sqrt(0.25));
  });

  test('formatMetricValue formats Kenyan currency and numbers', () => {
    expect(formatMetricValue('gdpPerCapita', 492000)).toContain('KES');
    expect(formatMetricValue('population', 1208333)).toContain('1,208,333');
    expect(formatMetricValue('populationDensity', 5495.2)).toContain('/ km²');
    expect(formatMetricValue('infrastructureScore', 84.5)).toBe('84.5 / 100');
  });
});
