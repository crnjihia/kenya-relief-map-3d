import { useState, useEffect, useCallback } from 'react';

export type MetricType =
  | 'population'
  | 'populationDensity'
  | 'gdpPerCapita'
  | 'infrastructureScore';

export interface CountyIndicatorData {
  code: number;
  id: string;
  name: string;
  capital: string;
  region: string;
  areaKm2: number;
  population: number;
  populationDensity: number;
  gdpPerCapita: number;
  infrastructureScore: number;
  ranks: {
    population: number;
    populationDensity: number;
    gdpPerCapita: number;
    infrastructureScore: number;
  };
}

export interface NationalAverage {
  population: number;
  populationDensity: number;
  gdpPerCapita: number;
  infrastructureScore: number;
}

export interface MetricDefinition {
  label: string;
  unit: string;
  format: 'number' | 'currency' | 'score';
  description?: string;
  source?: string;
}

export interface IndicatorsPayload {
  metadata: {
    sources: Array<{ name: string; description: string }>;
    totalCounties: number;
    lastUpdated: string;
    metrics: Record<MetricType, MetricDefinition>;
  };
  nationalAverage: NationalAverage;
  counties: Record<string, CountyIndicatorData>;
  countiesList: CountyIndicatorData[];
}

export function useCountyIndicators() {
  const [data, setData] = useState<IndicatorsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/data/indicators.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((payload: IndicatorsPayload) => {
        if (!isMounted) return;
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load indicators:', err);
        setError(err.message || 'Failed to load county indicators');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getCounty = useCallback(
    (identifier: string | number | null): CountyIndicatorData | null => {
      if (!data || !identifier) return null;
      const key = String(identifier).toLowerCase();
      return (
        data.counties[key] ||
        data.counties[String(identifier)] ||
        data.countiesList.find(
          (c) =>
            c.code === Number(identifier) ||
            c.name.toLowerCase() === key ||
            c.id === String(identifier)
        ) ||
        null
      );
    },
    [data]
  );

  const getMetricBounds = useCallback(
    (metric: MetricType) => {
      if (!data || !data.countiesList || data.countiesList.length === 0) {
        return { min: 0, max: 1 };
      }
      const values = data.countiesList.map((c) => c[metric] ?? 0);
      return {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    },
    [data]
  );

  const getRankings = useCallback(
    (metric: MetricType) => {
      if (!data || !data.countiesList) return [];
      return [...data.countiesList].sort((a, b) => b[metric] - a[metric]);
    },
    [data]
  );

  return {
    indicators: data,
    nationalAverage: data?.nationalAverage ?? null,
    countiesList: data?.countiesList ?? [],
    getCounty,
    getMetricBounds,
    getRankings,
    loading,
    error,
  };
}
