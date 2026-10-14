/**
 * Kenya Bounding Box and Geometric Center
 * Longitude: 33.9° E to 41.9° E (~8.0° span)
 * Latitude: -4.8° S to 4.7° N (~9.5° span)
 */
export const KENYA_BBOX = {
  minLng: 33.9,
  maxLng: 41.9,
  minLat: -4.8,
  maxLat: 4.7,
} as const;

export const KENYA_CENTER = {
  lng: (KENYA_BBOX.minLng + KENYA_BBOX.maxLng) / 2, // ~37.9° E
  lat: (KENYA_BBOX.minLat + KENYA_BBOX.maxLat) / 2, // ~-0.05° S (near equator)
} as const;

/**
 * Standard scene scale factor to map Kenya's ~8° longitude span
 * into ~20 units in Three.js world space, fitting comfortably within the camera FOV.
 */
export const DEFAULT_MAP_SCALE = 2.5;

export interface ProjectionOptions {
  centerLng?: number;
  centerLat?: number;
  scale?: number;
}

/**
 * Convert [lng, lat] to 3D flat plane [x, z] coordinates.
 * In Three.js:
 * - X axis points East (+lng)
 * - Z axis points South (-lat, so North is -Z)
 * Centered on Kenya's geographic center.
 */
export function lngLatToXZ(
  [lng, lat]: [number, number],
  options: ProjectionOptions = {}
): [number, number] {
  const centerLng = options.centerLng ?? KENYA_CENTER.lng;
  const centerLat = options.centerLat ?? KENYA_CENTER.lat;
  const scale = options.scale ?? DEFAULT_MAP_SCALE;

  const x = (lng - centerLng) * scale;
  const z = -(lat - centerLat) * scale;

  return [x, z];
}

/**
 * Inverse projection from [x, z] in Three.js world space back to [lng, lat].
 */
export function xzToLngLat(
  [x, z]: [number, number],
  options: ProjectionOptions = {}
): [number, number] {
  const centerLng = options.centerLng ?? KENYA_CENTER.lng;
  const centerLat = options.centerLat ?? KENYA_CENTER.lat;
  const scale = options.scale ?? DEFAULT_MAP_SCALE;

  const lng = centerLng + x / scale;
  const lat = centerLat - z / scale;

  return [lng, lat];
}
