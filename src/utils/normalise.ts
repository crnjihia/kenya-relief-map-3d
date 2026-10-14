/**
 * Normalise a numeric value to the range [targetMin, targetMax] given min and max bounds.
 * Clamps to bounds to prevent out-of-range artifacts.
 */
export function normalize(
  value: number,
  min: number,
  max: number,
  targetMin: number = 0,
  targetMax: number = 1
): number {
  if (max <= min) return targetMin;
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  return targetMin + t * (targetMax - targetMin);
}

/**
 * Normalise with a power/gamma curve to visually balance skewed metrics
 * (such as population density where Nairobi is >6000 while rural counties are <20).
 */
export function normalizeScaled(
  value: number,
  min: number,
  max: number,
  exponent: number = 0.5,
  targetMin: number = 0.05,
  targetMax: number = 1.0
): number {
  if (max <= min) return targetMin;
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  const shaped = Math.pow(t, exponent);
  return targetMin + shaped * (targetMax - targetMin);
}

/**
 * Format raw metric values into human-readable strings with Kenyan currency / units.
 */
export function formatMetricValue(metric: string, value: number): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  switch (metric) {
    case 'population':
      return value.toLocaleString('en-KE');
    case 'populationDensity':
      return `${value.toLocaleString('en-KE', { maximumFractionDigits: 1 })} / km²`;
    case 'gdpPerCapita':
      return `KES ${value.toLocaleString('en-KE')}`;
    case 'infrastructureScore':
      return `${value.toFixed(1)} / 100`;
    default:
      return value.toLocaleString('en-KE');
  }
}
