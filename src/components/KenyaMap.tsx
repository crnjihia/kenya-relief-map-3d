import { useEffect, useState, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Group } from 'three';
import { gsap } from 'gsap';
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

export default function KenyaMap({ metric = 'populationDensity' as const, onHover }: { metric?: string; onHover?: (id: string | null, value: any) => void }) {

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
  const groupRef = useRef<Group>(null);

  // Animate height morph on metric change
  useEffect(() => {
    if (groupRef.current) {
      // Reset scale to 0 then animate to 1 for a smooth morph effect
      groupRef.current.scale.set(1, 0, 1);
      gsap.to(groupRef.current.scale, { y: 1, duration: 1, ease: 'power2.out' });
    }
  }, [metric]);
  const raycaster = useMemo(() => new Raycaster(), []);

  useFrame(() => {
    if (!countyGeometries.length) return;
    // mouse coordinates are normalized device coordinates in state
    const { mouse } = useThree().getState();
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObjects(scene.children, true);
    if (intersect.length > 0) {
      const object = intersect[0].object;
      const id = (object as any).userData?.id || null;
      setHoveredId(id);
      // Notify parent about hover info
      if (onHover) {
        const value = id ? (indicators?.[id]?.[metric] ?? null) : null;
        onHover(id, value);
      }
    } else {
      setHoveredId(null);
      if (onHover) onHover(null, null);
    }
  });

  if (!countyGeometries.length) return null;

  const maxHeight = 1; // uniform max for shader uniform

  return (
    <>
      <group ref={groupRef}>
        {countyGeometries.map(({ id, geometry, height }) => (
          <CountyMesh
            key={id}
            id={id}
            geometry={geometry}
            maxHeight={maxHeight}
            isHovered={hoveredId === id}
          />
        ))}
      </group>
    </>
  );

}
