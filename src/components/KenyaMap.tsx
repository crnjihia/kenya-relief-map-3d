import { useEffect, useState, useMemo } from 'react';
import { Mesh } from 'three';
import { useLoader } from '@react-three/fiber';
import CountyMesh from './CountyMesh';
import { geoToGeometry } from '../utils/geoToGeometry';
import { lngLatToXZ } from '../utils/projection';
import { normalize } from '../utils/normalise';

type Feature = {
  geometry: any;
  properties: Record<string, any>;
};

type FeatureCollection = {
  type: string;
  features: Feature[];
};

export default function KenyaMap({ metric = 'populationDensity' as const }) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [indicators, setIndicators] = useState<any>(null);

  // Load GeoJSON
  useEffect(() => {
    fetch('/data/kenya_counties.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch(console.error);
    fetch('/data/indicators.json')
      .then((res) => res.json())
      .then(setIndicators)
      .catch(console.error);
  }, []);

  // Compute merged geometry based on selected metric
  const mergedGeometry = useMemo(() => {
    if (!geoData || !indicators) return null;
    // For now, compute a uniform height based on normalized metric range
    const values = geoData.features.map((f) => {
      const id = f.properties?.id || f.properties?.NAME || '';
      const val = indicators[id]?.[metric];
      return typeof val === 'number' ? val : 0;
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    const heights = values.map((v) => normalize(v, min, max));
    // Use average height for now
    const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
    // Convert GeoJSON to geometry with avgHeight
    return geoToGeometry(geoData, avgHeight);
  }, [geoData, indicators, metric]);

  if (!mergedGeometry) return null;

  // Determine max height for shader uniform (use 1 as max for normalized values)
  const maxHeight = 1;

  return <CountyMesh geometry={mergedGeometry} maxHeight={maxHeight} />;
}
