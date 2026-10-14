import React from 'react';
import KenyaMap from './components/KenyaMap';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ramani 3D — Kenya Development Indicators</h1>
        {/* Indicator selector will go here */}
        <div className="flex items-center space-x-2">
          <label htmlFor="metric" className="text-sm">Metric:</label>
          <select id="metric" name="metric" className="border rounded p-1">
            <option value="populationDensity">Population Density</option>
            <option value="population">Population</option>
            <option value="gdpPerCapita">GDP per Capita</option>
            <option value="infrastructureScore">Infrastructure Score</option>
          </select>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <KenyaMap />
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 text-center p-2 text-sm">
        Data sources: KNBS, GADM
      </footer>
    </div>
  );
}

export default App;
