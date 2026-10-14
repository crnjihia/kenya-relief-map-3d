/**
 * Normalise a numeric value to the range [0, 1] given min and max.
 * If max <= min, returns 0 to avoid division by zero.
 */
export function normalize(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (value - min) / (max - min);
}
