import type { MetricType } from '../hooks/useCountyIndicators';

export interface IndicatorSelectorProps {
  currentMetric: MetricType;
  onChange: (metric: MetricType) => void;
}

const METRIC_OPTIONS: Array<{
  value: MetricType;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
}> = [
  {
    value: 'populationDensity',
    label: 'Population Density',
    shortLabel: 'Density',
    unit: 'people / km²',
    description: 'KNBS 2019 Census population per square kilometer',
  },
  {
    value: 'population',
    label: 'Total Population',
    shortLabel: 'Population',
    unit: 'residents',
    description: 'Official 2019 Kenya National Census population',
  },
  {
    value: 'gdpPerCapita',
    label: 'GDP per Capita',
    shortLabel: 'GDP / Cap',
    unit: 'KES',
    description: 'Estimated Gross County Product per person',
  },
  {
    value: 'infrastructureScore',
    label: 'Infrastructure Index',
    shortLabel: 'Infrastructure',
    unit: 'score 0-100',
    description: 'Composite roads, power, water & mobile index',
  },
];

export default function IndicatorSelector({
  currentMetric,
  onChange,
}: IndicatorSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-lg">
      <div className="hidden sm:flex items-center pl-2 pr-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
        Metric:
      </div>

      <div className="flex items-center gap-1">
        {METRIC_OPTIONS.map((opt) => {
          const isActive = currentMetric === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title={opt.description}
            >
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
