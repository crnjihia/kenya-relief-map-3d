import { BufferGeometry, ExtrudeGeometry, Shape, Path } from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

/**
 * Convert a GeoJSON FeatureCollection of Polygon/MultiPolygon features into a single merged BufferGeometry.
 * Each feature is extruded to the given `height` (default 1).
 */
export function geoToGeometry(featureCollection: FeatureCollection, height: number = 1): BufferGeometry {
  const geometries: BufferGeometry[] = [];

  featureCollection.features.forEach((feature) => {
    const geom = feature.geometry;
    if (!geom) return;
    if (geom.type === 'Polygon') {
      const shape = polygonToShape(geom.coordinates);
      const extrude = new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
      geometries.push(extrude);
    } else if (geom.type === 'MultiPolygon') {
      (geom as MultiPolygon).coordinates.forEach((polygonCoords) => {
        const shape = polygonToShape(polygonCoords);
        const extrude = new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
        geometries.push(extrude);
      });
    }
  });

  if (geometries.length === 0) {
    // Return empty geometry to avoid errors downstream
    return new BufferGeometry();
  }

  // Merge all geometries into one for performance
  const merged = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
  return merged as BufferGeometry;
}

/** Convert polygon coordinates (array of linear rings) to a Three.js Shape. */
function polygonToShape(polygon: number[][][]): Shape {
  const shape = new Shape();
  // Outer ring
  const outer = polygon[0];
  outer.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  // Holes (if any)
  for (let i = 1; i < polygon.length; i++) {
    const holeCoords = polygon[i];
    const holePath = new Path();
    holeCoords.forEach(([x, y], j) => {
      if (j === 0) holePath.moveTo(x, y);
      else holePath.lineTo(x, y);
    });
    shape.holes.push(holePath);
  }
  return shape;
}
