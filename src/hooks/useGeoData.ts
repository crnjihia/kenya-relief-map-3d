import { useState, useEffect, useMemo } from 'react';
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import { createCountyGeometry, type CountyGeometryResult } from '../utils/geoToGeometry';

export interface CountyFeatureItem {
  id: string;
  code: number;
  name: string;
  feature: Feature<Polygon | MultiPolygon>;
  geometryResult: CountyGeometryResult;
}

export function useGeoData() {
  const [geoData, setGeoData] = useState<FeatureCollection<Polygon | MultiPolygon> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(15);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const basePath = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
    const dataUrl = basePath ? `${basePath}/data/kenya_counties.geojson` : './data/kenya_counties.geojson';

    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        setProgress(45);
        return res.json();
      })
      .then((data: FeatureCollection<Polygon | MultiPolygon>) => {
        if (!isMounted) return;
        setProgress(75);
        setGeoData(data);
        setProgress(100);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load Kenya GeoJSON data:', err);
        setError(err.message || 'Failed to load county geometries');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-calculate base extruded geometry per county (memoized for high 60fps performance)
  const countyItems = useMemo<CountyFeatureItem[]>(() => {
    if (!geoData || !geoData.features) return [];

    return geoData.features
      .filter((f: Feature<Polygon | MultiPolygon>) => {
        const p = f.properties as Record<string, any> | null;
        return p && (p.COUNTY_COD > 0 || p.code > 0);
      })
      .map((feature: Feature<Polygon | MultiPolygon>) => {
        const props = (feature.properties || {}) as Record<string, any>;
        const code = Number(props.code ?? props.COUNTY_COD ?? 0);
        const name = String(props.name ?? props.COUNTY_NAM ?? `County ${code}`);
        const id = String(props.id ?? code);

        const geometryResult = createCountyGeometry(feature, 1.0);

        return {
          id,
          code,
          name,
          feature,
          geometryResult,
        };
      });
  }, [geoData]);

  return { geoData, countyItems, loading, progress, error };
}
