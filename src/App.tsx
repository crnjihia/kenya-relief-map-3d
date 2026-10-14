import { useState, useRef, useCallback, useEffect } from 'react';
import { Vector3 } from 'three';
import Scene, { type SceneHandle } from './components/Scene';
import Tooltip from './components/Tooltip';
import DetailPanel from './components/DetailPanel';
import Legend from './components/Legend';
import IndicatorSelector from './components/IndicatorSelector';
import LoadingScreen from './components/LoadingScreen';
import { useGeoData } from './hooks/useGeoData';
import { useCountyIndicators, type MetricType } from './hooks/useCountyIndicators';

export default function App() {
  const [metric, setMetric] = useState<MetricType>('populationDensity');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<Vector3 | null>(null);

  const sceneRef = useRef<SceneHandle>(null);

  const { countyItems, loading: geoLoading, progress: geoProgress } = useGeoData();
  const {
    indicators,
    nationalAverage,
    countiesList,
    getCounty,
    getMetricBounds,
    getRankings,
    loading: indLoading,
  } = useCountyIndicators();

  const isLoading = geoLoading || indLoading || countyItems.length === 0;

  // Hover handler
  const handleHover = useCallback(
    (id: string | null, clientX?: number, clientY?: number) => {
      setHoveredId(id);
      if (clientX !== undefined && clientY !== undefined) {
        setHoverPos({ x: clientX, y: clientY });
      }
    },
    []
  );

  // Selection handler
  const handleSelect = useCallback(
    (id: string | null, center?: Vector3) => {
      setSelectedId(id);
      if (center) {
        setFocusTarget(center.clone());
      } else if (id) {
        // Lookup county center if available
        const item = countyItems.find((c) => c.id === id);
        if (item) {
          setFocusTarget(item.geometryResult.center.clone());
        }
      }
    },
    [countyItems]
  );

  const handleResetCamera = useCallback(() => {
    setSelectedId(null);
    setFocusTarget(null);
    if (sceneRef.current) {
      sceneRef.current.resetView();
    }
  }, []);

  const handleFocusSelected = useCallback(() => {
    if (!selectedId) return;
    const item = countyItems.find((c) => c.id === selectedId);
    if (item && sceneRef.current) {
      sceneRef.current.focusOn(item.geometryResult.center);
    }
  }, [selectedId, countyItems]);

  // Current metric boundaries and ranked extremes
  const metricBounds = getMetricBounds(metric);
  const rankings = getRankings(metric);
  const topCounty = rankings.length > 0 ? rankings[0] : null;
  const bottomCounty = rankings.length > 0 ? rankings[rankings.length - 1] : null;

  const hoveredCounty = getCounty(hoveredId);
  const selectedCounty = getCounty(selectedId);

  // Close detail panel with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col select-none">
      {/* Loading Overlay */}
      {isLoading && (
        <LoadingScreen
          progress={geoProgress}
          message="Constructing 3D Extruded County Geometry..."
        />
      )}

      {/* Top Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 h-16 px-4 md:px-6 flex items-center justify-between pointer-events-none bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-[2px]">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-[1px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <span className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                3D
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                Ramani 3D
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Kenya
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide mt-0.5 hidden sm:block">
              County Development Indicators 3D Explorer
            </p>
          </div>
        </div>

        {/* Center: Metric Selector */}
        <div className="pointer-events-auto hidden md:block">
          <IndicatorSelector currentMetric={metric} onChange={setMetric} />
        </div>

        {/* Right side controls: County Search & Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick County Jump Select */}
          <select
            value={selectedId || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleSelect(val || null);
            }}
            className="text-xs bg-slate-900/80 border border-slate-700/80 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer backdrop-blur-md max-w-[140px] sm:max-w-[180px]"
          >
            <option value="">Jump to County (47)...</option>
            {countiesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}. {c.name}
              </option>
            ))}
          </select>

          {/* Reset Camera Button */}
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-md backdrop-blur-md transition-all"
            title="Reset Camera to Overview"
          >
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>
      </header>

      {/* Mobile Indicator Selector (under header on small screens) */}
      <div className="absolute top-16 left-4 right-4 z-20 md:hidden flex justify-center pointer-events-auto">
        <IndicatorSelector currentMetric={metric} onChange={setMetric} />
      </div>

      {/* Main 3D Canvas Viewport */}
      <main className="flex-1 w-full h-full relative">
        <Scene
          ref={sceneRef}
          metric={metric}
          countyItems={countyItems}
          indicators={indicators}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onHover={handleHover}
          onSelect={handleSelect}
          focusTarget={focusTarget}
        />

        {/* Hover Tooltip HUD */}
        <Tooltip
          county={hoveredCounty}
          metric={metric}
          position={hoverPos}
          visible={Boolean(hoveredId && hoveredCounty && hoveredId !== selectedId)}
          nationalAverage={nationalAverage ? nationalAverage[metric] : undefined}
        />

        {/* Slide-in Detail Panel Drawer */}
        <DetailPanel
          county={selectedCounty}
          nationalAverage={nationalAverage}
          selectedMetric={metric}
          onSelectMetric={setMetric}
          onClose={() => setSelectedId(null)}
          onFocus={handleFocusSelected}
        />

        {/* Bottom Left: Legend */}
        <div className="absolute bottom-10 left-4 z-20 pointer-events-auto">
          <Legend
            metric={metric}
            min={metricBounds.min}
            max={metricBounds.max}
            nationalAverage={nationalAverage ? nationalAverage[metric] : undefined}
          />
        </div>

        {/* Bottom Center / Right: Metric Leaders Pill */}
        {topCounty && bottomCounty && (
          <div className="absolute bottom-10 right-4 sm:right-6 z-20 hidden md:flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-2xl text-xs pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-400">Highest:</span>
              <button
                onClick={() => handleSelect(topCounty.id)}
                className="font-semibold text-slate-100 hover:text-sky-300 underline underline-offset-2 decoration-slate-600"
              >
                {topCounty.name}
              </button>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-400">Lowest:</span>
              <button
                onClick={() => handleSelect(bottomCounty.id)}
                className="font-semibold text-slate-100 hover:text-sky-300 underline underline-offset-2 decoration-slate-600"
              >
                {bottomCounty.name}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Bar */}
      <footer className="h-8 px-4 z-30 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span>
            Data Sources:{' '}
            <span className="text-slate-300 font-medium">KNBS 2019 Census</span>,{' '}
            <span className="text-slate-300 font-medium">GADM Level 1</span>,{' '}
            <span className="text-slate-300 font-medium">IEBC</span>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-emerald-400/90">
            Open Civic Data Visualisation
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[10px]">
          <span className="hidden lg:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Left Click + Drag
            </kbd>{' '}
            Rotate
          </span>
          <span className="hidden lg:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Right Click + Drag
            </kbd>{' '}
            Pan
          </span>
          <span className="hidden lg:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Scroll
            </kbd>{' '}
            Zoom
          </span>
          <span>Click county for analytics</span>
        </div>
      </footer>
    </div>
  );
}
