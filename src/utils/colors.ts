import { DataTexture, RGBFormat, UnsignedByteType } from 'three';

/**
 * Generate a 256×1 texture representing a colour ramp from blue → cyan → green → yellow → red.
 * The gradient is sampled linearly. This texture can be used in the fragment shader to map
 * a normalised value (0‑1) to a colour.
 */
export function createColorRampTexture(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * 3);
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    // Simple piecewise gradient
    let r = 0,
      g = 0,
      b = 0;
    if (t < 0.25) {
      // blue to cyan
      const local = t / 0.25;
      r = 0;
      g = Math.round(255 * local);
      b = 255;
    } else if (t < 0.5) {
      // cyan to green
      const local = (t - 0.25) / 0.25;
      r = 0;
      g = 255;
      b = Math.round(255 * (1 - local));
    } else if (t < 0.75) {
      // green to yellow
      const local = (t - 0.5) / 0.25;
      r = Math.round(255 * local);
      g = 255;
      b = 0;
    } else {
      // yellow to red
      const local = (t - 0.75) / 0.25;
      r = 255;
      g = Math.round(255 * (1 - local));
      b = 0;
    }
    data[i * 3] = r;
    data[i * 3 + 1] = g;
    data[i * 3 + 2] = b;
  }
  const texture = new DataTexture(data, size, 1, RGBFormat, UnsignedByteType);
  texture.needsUpdate = true;
  return texture;
}
