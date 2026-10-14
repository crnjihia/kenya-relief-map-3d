import React from 'react';

type DetailPanelProps = {
  countyId: string | null;
  indicators: Record<string, any> | null;
};

export default function DetailPanel({ countyId, indicators }: DetailPanelProps) {
  if (!countyId) return null;
  const data = indicators?.[countyId];
  if (!data) return <div className="p-4">No data available</div>;
  return (
    <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg p-4 overflow-auto">
      <h2 className="text-lg font-semibold">{countyId}</h2>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span>{key}</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
