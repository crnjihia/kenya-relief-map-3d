/** Simple equirectangular projection from lng/lat to X/Z coordinates.
 * This is a placeholder implementation; adjust scaling as needed to fit the scene.
 */
export function lngLatToXZ([lng, lat]: [number, number]): [number, number] {
  const scale = 0.1; // arbitrary scaling factor to keep geometry within view
  return [lng * scale, lat * scale];
}
