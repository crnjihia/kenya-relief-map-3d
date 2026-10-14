import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { CountyIndicatorData, NationalAverage, MetricType } from '../hooks/useCountyIndicators';
import { formatMetricValue } from '../utils/normalise';
import { sampleRampHex } from '../utils/colors';

export interface DetailPanelProps {
  county: CountyIndicatorData | null;
  nationalAverage: NationalAverage | null;
  selectedMetric: MetricType;
  onSelectMetric: (m: MetricType) => void;
  onClose: () => void;
  onFocus: () => void;
}

export default function DetailPanel({
  county,
  nationalAverage,
  selectedMetric,
  onSelectMetric,
  onClose,
  onFocus,
}: DetailPanelProps) {
  if (!county || !nationalAverage) return null;

  // Prepare normalized % comparison vs National Average (100% = National Average)
  const comparisonData = [
    {
      metricKey: 'population' as MetricType,
      label: 'Population',
      countyVal: county.population,
      nationalVal: nationalAverage.population,
      ratio: Math.round((county.population / nationalAverage.population) * 100),
      formattedCounty: formatMetricValue('population', county.population),
      formattedNat: formatMetricValue('population', nationalAverage.population),
      rank: county.ranks.population,
    },
    {
      metricKey: 'populationDensity' as MetricType,
      label: 'Density',
      countyVal: county.populationDensity,
      nationalVal: nationalAverage.populationDensity,
      ratio: Math.round((county.populationDensity / nationalAverage.populationDensity) * 100),
      formattedCounty: formatMetricValue('populationDensity', county.populationDensity),
      formattedNat: formatMetricValue('populationDensity', nationalAverage.populationDensity),
      rank: county.ranks.populationDensity,
    },
    {
      metricKey: 'gdpPerCapita' as MetricType,
      label: 'GDP / Cap',
      countyVal: county.gdpPerCapita,
      nationalVal: nationalAverage.gdpPerCapita,
      ratio: Math.round((county.gdpPerCapita / nationalAverage.gdpPerCapita) * 100),
      formattedCounty: formatMetricValue('gdpPerCapita', county.gdpPerCapita),
      formattedNat: formatMetricValue('gdpPerCapita', nationalAverage.gdpPerCapita),
      rank: county.ranks.gdpPerCapita,
    },
    {
      metricKey: 'infrastructureScore' as MetricType,
      label: 'Infra Index',
      countyVal: county.infrastructureScore,
      nationalVal: nationalAverage.infrastructureScore,
      ratio: Math.round((county.infrastructureScore / nationalAverage.infrastructureScore) * 100),
      formattedCounty: formatMetricValue('infrastructureScore', county.infrastructureScore),
      formattedNat: formatMetricValue('infrastructureScore', nationalAverage.infrastructureScore),
      rank: county.ranks.infrastructureScore,
    },
  ];

  const indicatorCards: Array<{
    key: MetricType;
    title: string;
    value: string;
    rank: number;
    sub: string;
  }> = [
    {
      key: 'population',
      title: 'Total Population',
      value: formatMetricValue('population', county.population),
      rank: county.ranks.population,
      sub: 'KNBS 2019 Census',
    },
    {
      key: 'populationDensity',
      title: 'Population Density',
      value: formatMetricValue('populationDensity', county.populationDensity),
      rank: county.ranks.populationDensity,
      sub: `Area: ${county.areaKm2.toLocaleString()} km²`,
    },
    {
      key: 'gdpPerCapita',
      title: 'GDP per Capita',
      value: formatMetricValue('gdpPerCapita', county.gdpPerCapita),
      rank: county.ranks.gdpPerCapita,
      sub: 'Gross County Product',
    },
    {
      key: 'infrastructureScore',
      title: 'Infrastructure Index',
      value: formatMetricValue('infrastructureScore', county.infrastructureScore),
      rank: county.ranks.infrastructureScore,
      sub: 'Composite Connectivity',
    },
  ];

  return (
    <aside className="fixed top-16 right-0 bottom-8 w-96 max-w-[92vw] z-40 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/60 shadow-2xl flex flex-col text-slate-100 transition-all duration-300 ease-out animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              County {county.code.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              {county.region} Region
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            {county.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Capital: <span className="text-slate-200 font-medium">{county.capital}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* Action button to re-focus camera */}
        <button
          onClick={onFocus}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Focus Camera on {county.name}
        </button>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {indicatorCards.map((card) => {
            const isActive = selectedMetric === card.key;
            const rankRatio = 1 - (card.rank - 1) / 46;
            const rankColor = sampleRampHex(rankRatio);

            return (
              <div
                key={card.key}
                onClick={() => onSelectMetric(card.key)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500/50'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {card.title}
                  </span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold"
                    style={{
                      backgroundColor: `${rankColor}22`,
                      color: rankColor,
                      border: `1px solid ${rankColor}44`,
                    }}
                  >
                    #{card.rank}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                  {card.value}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {card.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recharts Bar Chart: County vs National Average */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                County vs National Benchmark
              </h3>
              <p className="text-[11px] text-slate-400">
                Index: 100% = Kenya National Average
              </p>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dataMax: number) => Math.max(160, Math.min(600, dataMax * 1.15))]}
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <ReferenceLine
                  x={100}
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  label={{ value: 'Nat’l Avg (100%)', fill: '#38bdf8', fontSize: 9, position: 'top' }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 text-xs p-2.5 rounded-lg shadow-xl">
                          <p className="font-semibold text-white">{data.label}</p>
                          <p className="text-sky-300 mt-1">County: {data.formattedCounty}</p>
                          <p className="text-slate-400">National Avg: {data.formattedNat}</p>
                          <p className="font-mono text-emerald-400 mt-1">Ratio: {data.ratio}% of average</p>
                          <p className="text-slate-400">Rank: #{data.rank} of 47</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="ratio" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((entry) => {
                    const isSelected = selectedMetric === entry.metricKey;
                    return (
                      <Cell
                        key={entry.metricKey}
                        fill={isSelected ? '#38bdf8' : entry.ratio >= 100 ? '#10b981' : '#f59e0b'}
                        fillOpacity={0.85}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Civic data overview summary */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Civic Profile Summary
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {county.name} accounts for{' '}
            <span className="text-sky-300 font-medium">
              {((county.population / (nationalAverage.population * 47)) * 100).toFixed(2)}%
            </span>{' '}
            of Kenya's total population. Its GDP per capita is{' '}
            <span className="text-sky-300 font-medium">
              {county.gdpPerCapita > nationalAverage.gdpPerCapita ? 'above' : 'below'}
            </span>{' '}
            the national average, ranking{' '}
            <span className="text-amber-300 font-medium">#{county.ranks.gdpPerCapita}</span> nationally.
          </p>
        </div>
      </div>
    </aside>
  );
}
