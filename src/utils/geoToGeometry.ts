import {
  BufferGeometry,
  ExtrudeGeometry,
  Shape,
  Path,
  Vector3,
  Box3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import { lngLatToXZ } from './projection';

export interface CountyGeometryResult {
  geometry: BufferGeometry;
  center: Vector3;
  bounds: Box3;
}

/**
 * Simplify a linear ring of coordinates if vertex count is high.
 * Preserves shape while eliminating sub-pixel redundant vertices.
 */
function simplifyRing(coords: number[][], tolerance: number = 0.002): number[][] {
  if (coords.length <= 16) return coords;

  const result: number[][] = [coords[0]];
  let prev = coords[0];

  for (let i = 1; i < coords.length - 1; i++) {
    const curr = coords[i];
    const dx = curr[0] - prev[0];
    const dy = curr[1] - prev[1];
    if (dx * dx + dy * dy >= tolerance * tolerance) {
      result.push(curr);
      prev = curr;
    }
  }

  result.push(coords[coords.length - 1]);
  return result;
}

/**
 * Convert GeoJSON polygon coordinates (array of linear rings) to a Three.js Shape.
 * Each [lng, lat] coordinate is projected to [x, z].
 * The shape coordinates (x, y) map to (x, -z) so that after rotateX(-PI/2),
 * the geometry lies in the XZ plane extruding up along +Y.
 */
export function polygonCoordsToShape(polygon: number[][][]): Shape {
  const shape = new Shape();
  if (!polygon || polygon.length === 0 || polygon[0].length === 0) {
    return shape;
  }

  // Outer boundary ring
  const outer = simplifyRing(polygon[0]);
  outer.forEach(([lng, lat], i) => {
    const [x, z] = lngLatToXZ([lng, lat]);
    if (i === 0) {
      shape.moveTo(x, -z);
    } else {
      shape.lineTo(x, -z);
    }
  });

  // Inner rings (holes)
  for (let i = 1; i < polygon.length; i++) {
    const holeCoords = simplifyRing(polygon[i]);
    if (holeCoords.length > 2) {
      const holePath = new Path();
      holeCoords.forEach(([lng, lat], j) => {
        const [x, z] = lngLatToXZ([lng, lat]);
        if (j === 0) {
          holePath.moveTo(x, -z);
        } else {
          holePath.lineTo(x, -z);
        }
      });
      shape.holes.push(holePath);
    }
  }

  return shape;
}

/**
 * Build an extruded 3D BufferGeometry for a single GeoJSON Feature
 * (Polygon or MultiPolygon).
 *
 * - Height: Extrusion along Y axis. Default unit height is 1.0 (scaled via mesh or custom height).
 * - Rotates geometry -90° around X axis so map lies on XZ plane and extrudes upwards (+Y).
 * - MultiPolygon parts are merged into a single BufferGeometry for draw-call efficiency.
 */
export function createCountyGeometry(
  feature: Feature<Polygon | MultiPolygon>,
  height: number = 1.0
): CountyGeometryResult {
  const geom = feature.geometry;
  const extrudeSettings = {
    depth: Math.max(0.05, height),
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  };

  const geometries: BufferGeometry[] = [];

  if (geom.type === 'Polygon') {
    const shape = polygonCoordsToShape(geom.coordinates);
    if (shape.curves.length > 0) {
      const extrude = new ExtrudeGeometry(shape, extrudeSettings);
      geometries.push(extrude);
    }
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates.forEach((polyCoords: number[][][]) => {
      const shape = polygonCoordsToShape(polyCoords);
      if (shape.curves.length > 0) {
        const extrude = new ExtrudeGeometry(shape, extrudeSettings);
        geometries.push(extrude);
      }
    });
  }

  let finalGeometry: BufferGeometry;

  if (geometries.length === 0) {
    finalGeometry = new BufferGeometry();
  } else if (geometries.length === 1) {
    finalGeometry = geometries[0];
  } else {
    const merged = mergeGeometries(geometries, false);
    finalGeometry = merged || geometries[0];
  }

  // Rotate geometry so it sits on XZ ground plane and extrudes UPWARD (+Y)
  finalGeometry.rotateX(-Math.PI / 2);
  finalGeometry.computeVertexNormals();
  finalGeometry.computeBoundingBox();

  const bounds = finalGeometry.boundingBox || new Box3();
  const center = new Vector3();
  bounds.getCenter(center);

  return {
    geometry: finalGeometry,
    center,
    bounds,
  };
}

/**
 * Legacy adapter for backward compatibility
 */
export function geoToGeometry(
  featureCollection: { features: Feature<Polygon | MultiPolygon>[] },
  height: number = 1.0
): BufferGeometry {
  if (!featureCollection.features || featureCollection.features.length === 0) {
    return new BufferGeometry();
  }
  return createCountyGeometry(featureCollection.features[0], height).geometry;
}
