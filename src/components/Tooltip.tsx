import type { CountyIndicatorData, MetricType } from '../hooks/useCountyIndicators';
import { formatMetricValue } from '../utils/normalise';
import { sampleRampHex } from '../utils/colors';

export interface TooltipProps {
  county: CountyIndicatorData | null;
  metric: MetricType;
  position: { x: number; y: number };
  visible: boolean;
  nationalAverage?: number;
}

export default function Tooltip({
  county,
  metric,
  position,
  visible,
  nationalAverage,
}: TooltipProps) {
  if (!visible || !county) return null;

  const value = county[metric];
  const rank = county.ranks[metric];
  const formattedVal = formatMetricValue(metric, value);

  // Compute percentage comparison vs national average
  let diffPercent: string | null = null;
  if (nationalAverage && nationalAverage > 0) {
    const pct = ((value - nationalAverage) / nationalAverage) * 100;
    diffPercent = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
  }

  // Calculate position with screen boundary clamping
  const tooltipWidth = 240;
  const tooltipHeight = 110;
  const padding = 16;

  const left = Math.min(
    Math.max(padding, position.x + 14),
    window.innerWidth - tooltipWidth - padding
  );
  const top = Math.min(
    Math.max(padding, position.y - tooltipHeight - 10),
    window.innerHeight - tooltipHeight - padding
  );

  const metricLabels: Record<MetricType, string> = {
    population: 'Population',
    populationDensity: 'Density',
    gdpPerCapita: 'GDP per Capita',
    infrastructureScore: 'Infra Score',
  };

  // Color dot based on rank
  const normalizedRank = 1 - (rank - 1) / 46;
  const dotColor = sampleRampHex(normalizedRank);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-xl p-3 text-white w-60">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: dotColor }}
            />
            <h4 className="font-semibold text-sm tracking-wide text-slate-100">
              {county.name}
            </h4>
          </div>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/50">
            #{rank} / 47
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xs text-slate-400 font-medium">
            {metricLabels[metric]}
          </span>
          <span className="text-sm font-bold text-sky-300 font-mono">
            {formattedVal}
          </span>
        </div>

        {diffPercent && (
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">vs Nat'l Avg:</span>
            <span
              className={`font-semibold font-mono ${
                diffPercent.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {diffPercent}
            </span>
          </div>
        )}

        <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Capital: {county.capital}</span>
          <span className="text-sky-400/80 font-medium">Click to inspect</span>
        </div>
      </div>
    </div>
  );
}
