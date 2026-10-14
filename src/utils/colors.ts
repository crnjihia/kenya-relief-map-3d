import {
  DataTexture,
  RGBAFormat,
  UnsignedByteType,
  LinearFilter,
  ClampToEdgeWrapping,
} from 'three';

export interface ColorStop {
  stop: number;
  r: number;
  g: number;
  b: number;
  hex: string;
}

/**
 * 5-stop vibrant, perception-tuned color ramp from Low to High indicators:
 * 0.00: Deep Indigo / Blue (#1e3a8a) - lowest
 * 0.25: Vibrant Cyan (#06b6d4)
 * 0.50: Emerald Green (#10b981) - median
 * 0.75: Amber Gold (#f59e0b)
 * 1.00: Coral Red (#ef4444) - highest
 */
export const COLOR_STOPS: ColorStop[] = [
  { stop: 0.0, r: 30, g: 58, b: 138, hex: '#1e3a8a' },
  { stop: 0.25, r: 6, g: 182, b: 212, hex: '#06b6d4' },
  { stop: 0.5, r: 16, g: 185, b: 129, hex: '#10b981' },
  { stop: 0.75, r: 245, g: 158, b: 11, hex: '#f59e0b' },
  { stop: 1.0, r: 239, g: 68, b: 68, hex: '#ef4444' },
];

export const CSS_COLOR_RAMP_GRADIENT =
  'linear-gradient(to right, #1e3a8a 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)';

/**
 * Procedural linear interpolation between color stops
 */
export function sampleRampRgb(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const s0 = COLOR_STOPS[i];
    const s1 = COLOR_STOPS[i + 1];
    if (clamped >= s0.stop && clamped <= s1.stop) {
      const segmentT = (clamped - s0.stop) / (s1.stop - s0.stop);
      const r = Math.round(s0.r + (s1.r - s0.r) * segmentT);
      const g = Math.round(s0.g + (s1.g - s0.g) * segmentT);
      const b = Math.round(s0.b + (s1.b - s0.b) * segmentT);
      return [r, g, b];
    }
  }

  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  return [last.r, last.g, last.b];
}

export function sampleRampHex(t: number): string {
  const [r, g, b] = sampleRampRgb(t);
  const hex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/**
 * Generate a 256x1 RGBA DataTexture for GLSL shader sampling.
 * Uses RGBAFormat (Three.js r186 compatible).
 */
export function createColorRampTexture(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * 4);

  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    const [r, g, b] = sampleRampRgb(t);
    const offset = i * 4;
    data[offset] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
    data[offset + 3] = 255;
  }

  const texture = new DataTexture(data, size, 1, RGBAFormat, UnsignedByteType);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}
