# Ramani 3D – Kenya Development Indicators

## Overview
"Ramani 3D" is an interactive 3‑D visualisation of Kenya’s county‑level development indicators. It renders county boundaries as extruded shapes, colours them via a custom GLSL shader, and provides hover tooltips, click‑to‑focus interactions, and detailed charts.

## Live Demo
[Live demo (placeholder)](https://your-deployment-url.vercel.app)

## Data Sources
- **County boundaries** – GADM level 1 GeoJSON (public)
- **Population** – KNBS 2019 census
- **Population density** – calculated from population and area
- **GDP per capita** – estimated economic data
- **Infrastructure score** – composite index (0‑100)

## Architecture
```
src/
├─ App.tsx                 # Layout, metric selector, tooltip, detail panel
├─ components/
│  ├─ KenyaMap.tsx        # Loads data, creates per‑county meshes, handles interactions
│  ├─ CountyMesh.tsx       # Renders a single county mesh with shader material
│  ├─ Scene.tsx            # Canvas wrapper with lights & controls (future use)
│  ├─ Tooltip.tsx          # DOM tooltip overlay
│  ├─ Legend.tsx           # Colour‑ramp legend
│  ├─ DetailPanel.tsx      # Side panel with county stats & Recharts charts
│  └─ ...
├─ shaders/
│  ├─ county.vert.glsl     # Vertex shader passes height & normal
│  └─ county.frag.glsl     # Fragment shader samples 1‑pixel colour‑ramp texture + rim lighting
├─ hooks/
│  ├─ useCameraFocus.ts    # GSAP animation to focus camera on a county
│  └─ ...
├─ utils/
│  ├─ geoToGeometry.ts     # Converts GeoJSON → merged ExtrudeGeometry per county
│  ├─ projection.ts        # Simple equirectangular lng/lat → X/Z conversion
│  ├─ normalise.ts         # Normalises indicator values to [0, 1]
│  └─ colors.ts            # Generates 1‑pixel colour‑ramp texture (blue‑cyan‑green‑yellow‑red)
└─ data/
   ├─ kenya_counties.geojson
   └─ indicators.json
```

## Performance notes
- Geometry is memoised per county and merged where possible.
- LOD simplification is applied at runtime via `three-mesh-simplify` (future).
- Target 60 fps on mid‑range laptops.

## Updating data
Replace `public/data/kenya_counties.geojson` and `src/data/indicators.json` with new datasets. The app will automatically reload on next start.

## Development
```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm test             # run Vitest unit tests
npm run build        # production build
```

## CI / Deployment
GitHub Actions (`.github/workflows/ci.yml`) run tests and build on every push to `main`. Deploy to Vercel via the Vercel CLI (requires a `VERCEL_TOKEN` secret).

## License
MIT – see `LICENSE` file.
