import { CSS_COLOR_RAMP_GRADIENT } from '../utils/colors';
import { formatMetricValue } from '../utils/normalise';
import type { MetricType } from '../hooks/useCountyIndicators';

export interface LegendProps {
  metric: MetricType;
  min: number;
  max: number;
  nationalAverage?: number;
}

export default function Legend({ metric, min, max, nationalAverage }: LegendProps) {
  const formattedMin = formatMetricValue(metric, min);
  const formattedMax = formatMetricValue(metric, max);
  const mid = min + (max - min) * 0.5;
  const formattedMid = formatMetricValue(metric, mid);

  const metricTitles: Record<MetricType, string> = {
    populationDensity: 'Population Density',
    population: 'Total Population',
    gdpPerCapita: 'GDP per Capita',
    infrastructureScore: 'Infrastructure Score',
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-2xl rounded-2xl p-3.5 text-white w-64 select-none">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
          {metricTitles[metric]}
        </span>
        <span className="text-[10px] text-sky-400 font-mono">3D Extrusion</span>
      </div>

      {/* Color ramp bar */}
      <div className="relative mt-2">
        <div
          className="w-full h-3.5 rounded-full shadow-inner border border-white/20"
          style={{ background: CSS_COLOR_RAMP_GRADIENT }}
        />

        {/* National Average marker if present */}
        {nationalAverage && nationalAverage >= min && nationalAverage <= max && (
          <div
            className="absolute -top-1 bottom-0 w-0.5 bg-white shadow-md"
            style={{
              left: `${Math.max(5, Math.min(95, ((nationalAverage - min) / (max - min)) * 100))}%`,
            }}
            title={`National Average: ${formatMetricValue(metric, nationalAverage)}`}
          >
            <div className="w-2 h-2 -ml-[3px] -mt-1 bg-white rounded-full shadow" />
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
        <div className="text-left">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Low</span>
          <span className="text-slate-200 font-medium">{formattedMin}</span>
        </div>

        <div className="text-center">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Mid</span>
          <span className="text-slate-400">{formattedMid}</span>
        </div>

        <div className="text-right">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400">High</span>
          <span className="text-slate-200 font-medium">{formattedMax}</span>
        </div>
      </div>
    </div>
  );
}
