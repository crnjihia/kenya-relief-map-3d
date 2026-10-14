import { useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster } from 'three';
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

  // Load GeoJSON and indicators
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

  // Compute per‑county geometries and heights
  const countyGeometries = useMemo(() => {
    if (!geoData || !indicators) return [];
    const values = geoData.features.map((f) => {
      const id = f.properties?.id || f.properties?.NAME || '';
      const val = indicators[id]?.[metric];
      return typeof val === 'number' ? val : 0;
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Build array of { id, geometry, height }
    return geoData.features.map((f, idx) => {
      const id = f.properties?.id || f.properties?.NAME || `county-${idx}`;
      const rawValue = indicators[id]?.[metric];
      const norm = normalize(typeof rawValue === 'number' ? rawValue : 0, min, max);
      const height = norm; // use normalized value as height (0‑1)
      const geometry = geoToGeometry({ type: 'FeatureCollection', features: [f] }, height);
      return { id, geometry, height };
    });
  }, [geoData, indicators, metric]);

  // Interaction: raycast for hover
  const { camera, scene } = useThree();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const raycaster = useMemo(() => new Raycaster(), []);

  useFrame(() => {
    if (!countyGeometries.length) return;
    // mouse coordinates are normalized device coordinates in state
    const { mouse } = useThree().getState();
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObjects(scene.children, true);
    if (intersect.length > 0) {
      const object = intersect[0].object;
      // Assume each mesh has userData.id set via CountyMesh component
      const id = (object as any).userData?.id || null;
      setHoveredId(id);
    } else {
      setHoveredId(null);
    }
  });

  if (!countyGeometries.length) return null;

  const maxHeight = 1; // uniform max for shader uniform

  return (
    <>
      {countyGeometries.map(({ id, geometry, height }) => (
        <CountyMesh
          key={id}
          id={id}
          geometry={geometry}
          maxHeight={maxHeight}
          isHovered={hoveredId === id}
        />
      ))}
    </>
  );
}
