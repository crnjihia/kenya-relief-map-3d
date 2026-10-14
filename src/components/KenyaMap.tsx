import { useMemo } from 'react';
import { Vector3 } from 'three';
import CountyMesh from './CountyMesh';
import type { CountyFeatureItem } from '../hooks/useGeoData';
import type { IndicatorsPayload, MetricType } from '../hooks/useCountyIndicators';
import { normalizeScaled, normalize } from '../utils/normalise';

export interface KenyaMapProps {
  metric: MetricType;
  countyItems: CountyFeatureItem[];
  indicators: IndicatorsPayload | null;
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null, clientX?: number, clientY?: number) => void;
  onSelect: (id: string | null, center?: Vector3) => void;
}

export default function KenyaMap({
  metric,
  countyItems,
  indicators,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: KenyaMapProps) {
  // Pre-calculate metric bounds and per-county normalized values
  const countyHeights = useMemo(() => {
    if (!indicators || countyItems.length === 0) return {};

    const values = countyItems.map((item) => {
      const county = indicators.counties[item.id] || indicators.counties[String(item.code)];
      return county ? county[metric] ?? 0 : 0;
    });

    const min = Math.min(...values);
    const max = Math.max(...values);

    const result: Record<string, { normalized: number; height: number }> = {};

    countyItems.forEach((item) => {
      const county = indicators.counties[item.id] || indicators.counties[String(item.code)];
      const raw = county ? county[metric] ?? 0 : 0;

      // Use perceptual scaling (sqrt exponent 0.45) for population density and population
      // which have severe urban vs rural skew, while linear scaling for scores and GDP
      let norm = 0;
      if (metric === 'populationDensity' || metric === 'population') {
        norm = normalizeScaled(raw, min, max, 0.45, 0.05, 1.0);
      } else {
        norm = normalize(raw, min, max, 0.05, 1.0);
      }

      // Height maps from 0.25 to 3.2 units along Y
      const height = 0.25 + norm * 2.8;
      result[item.id] = { normalized: norm, height };
    });

    return result;
  }, [countyItems, indicators, metric]);

  const handleCountyClick = (id: string, center: Vector3) => {
    onSelect(id, center);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 47 County Extruded 3D Meshes */}
      {countyItems.map((item) => {
        const heightData = countyHeights[item.id] || { normalized: 0.1, height: 0.3 };
        const isHovered = hoveredId === item.id;
        const isSelected = selectedId === item.id;

        return (
          <CountyMesh
            key={item.id}
            id={item.id}
            name={item.name}
            geometry={item.geometryResult.geometry}
            center={item.geometryResult.center}
            normalizedValue={heightData.normalized}
            height={heightData.height}
            isHovered={isHovered}
            isSelected={isSelected}
            onClick={handleCountyClick}
            onHover={onHover}
          />
        );
      })}

      {/* Decorative architectural grid pedestal */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 38]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.85}
          metalness={0.2}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      <gridHelper
        args={[34, 34, '#38bdf8', '#1e293b']}
        position={[0, -0.04, 0]}
      />
    </group>
  );
}
