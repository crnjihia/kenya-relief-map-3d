import { describe, expect, test } from 'vitest';
import { createCountyGeometry, polygonCoordsToShape } from '../src/utils/geoToGeometry';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

describe('geoToGeometry converter', () => {
  test('creates shape from simple polygon coordinates', () => {
    const coords = [
      [
        [37.0, -1.0],
        [38.0, -1.0],
        [38.0, 0.0],
        [37.0, 0.0],
        [37.0, -1.0],
      ],
    ];
    const shape = polygonCoordsToShape(coords);
    expect(shape.curves.length).toBeGreaterThan(0);
  });

  test('builds extruded 3D BufferGeometry with base on XZ plane and Y > 0', () => {
    const feature: Feature<Polygon> = {
      type: 'Feature',
      properties: { name: 'TestCounty' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [37.0, -1.0],
            [38.0, -1.0],
            [38.0, 0.0],
            [37.0, 0.0],
            [37.0, -1.0],
          ],
        ],
      },
    };

    const { geometry, center, bounds } = createCountyGeometry(feature, 2.0);

    expect(geometry.attributes.position).toBeDefined();
    expect(geometry.attributes.position.count).toBeGreaterThan(0);
    expect(bounds.min.y).toBeCloseTo(0, 1);
    expect(bounds.max.y).toBeGreaterThan(1.5);
    expect(center).toBeDefined();
  });

  test('merges MultiPolygon features into a single BufferGeometry', () => {
    const feature: Feature<MultiPolygon> = {
      type: 'Feature',
      properties: { name: 'IslandCounty' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [39.0, -4.0],
              [39.5, -4.0],
              [39.5, -3.5],
              [39.0, -3.5],
              [39.0, -4.0],
            ],
          ],
          [
            [
              [40.0, -4.0],
              [40.5, -4.0],
              [40.5, -3.5],
              [40.0, -3.5],
              [40.0, -4.0],
            ],
          ],
        ],
      },
    };

    const { geometry, bounds } = createCountyGeometry(feature, 1.0);
    expect(geometry.attributes.position.count).toBeGreaterThan(0);
    expect(bounds.max.y).toBeGreaterThan(0.5);
  });
});
