# LandGuard AI — Frontend Client

Enterprise Decision-Support and Land Acquisition Risk Intelligence client interface built with React, Vite, Tailwind CSS, Recharts, and Leaflet.

## Features
- **Executive Dashboard:** Macro-level portfolio KPIs, critical alerts queue, and corridor breakdown.
- **Acquisition Portfolio Registry:** Filterable, sortable statutory case table with CSV export.
- **GIS Spatial Risk Map:** Interactive Leaflet map with district risk indicators.
- **Explainable Case Dossier:** Modal view with TreeSHAP factor attributions and stage progression.
- **Dual Theme Support:** Calibrated enterprise Light theme and high-contrast institutional Dark mode.

## Development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000` with proxy to Flask backend on `http://127.0.0.1:5000`.

## Production Build

```bash
npm run build
```
Generates optimized static bundle in `dist/`.
