# WeatherScope

**Live demo:** [weather-sigma-pink-57.vercel.app](https://weather-sigma-pink-57.vercel.app)
**Designed and built by [Ronit Jitesh](https://ronit-jitesh.github.io)** · [GitHub](https://github.com/ronit-jitesh) · [LinkedIn](https://www.linkedin.com/in/ronit-jitesh-440a1319b)

A full-stack weather platform that turns raw forecast data into decisions. Search any
city, postcode, landmark or raw coordinate on Earth and get live conditions, hourly and
seven-day forecasts, air quality, and a smart day brief, all wrapped in a custom black
and neon-yellow design system with real 3D depth. Installable as an app, works offline,
and runs entirely on free, keyless APIs.

---

## What it does

**Forecasting**
- Current conditions with a hand-built SVG arc gauge (temperature, feels-like, wind, UV, humidity, pressure, cloud cover, sunrise and sunset)
- Hour-by-hour temperature curve for the next 24 hours
- Seven-day outlook with precipitation trend
- Daylight sun-arc showing the sun's live position between sunrise and sunset
- Air quality (PM2.5, PM10, EU and US AQI) on a matching arc gauge

**Intelligence**
- Smart day brief: best outdoor window, umbrella timing ("rain likely around 3pm"), UV and severe-weather flags, and activity verdicts for running, cycling, picnics and photography
- "What to pack" advisory derived from feels-like temperature, UV, rain and wind

**Product**
- Flexible location search: city, town, postcode, landmark (Nominatim fallback) or raw `lat,lon`, with keyboard navigation and full ARIA combobox semantics
- Browser geolocation, recent locations, last-location memory, shareable `?q=` deep links
- Compare up to three cities side by side, with warmest and driest auto-flagged
- °C/°F and km/h/mph toggle, persisted
- Full CRUD: save weather records for any location and date range (back to 1940), edit, delete, and export as JSON, CSV, XML, Markdown or PDF
- Installable PWA with an offline app shell

**Design**
- Black + electric-yellow (#FFFF1E) neon design system, built from scratch with Tailwind
- 3D particle field with mouse parallax, 3D tilt on cards, layered depth shadows
- Renders at full device pixel ratio, crisp on retina and 4K displays
- Responsive from phones to desktops; respects `prefers-reduced-motion`

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4, custom design tokens |
| Database | Supabase Postgres via Prisma 7 (`@prisma/adapter-pg`) |
| Validation | Zod on every API boundary |
| Weather | [Open-Meteo](https://open-meteo.com) forecast, archive (ERA5, back to 1940), air quality and geocoding APIs. No keys. |
| Geocoding fallback | Nominatim (OpenStreetMap) for landmarks |
| Map | React-Leaflet with dark CARTO tiles |
| Export | papaparse (CSV), xmlbuilder2 (XML), pdfkit (PDF) |

## Architecture notes

- The browser talks only to the app's own `/api/*` routes; the server fans out to
  Open-Meteo and Nominatim. No third-party keys, no CORS issues, responses cached
  server-side and prefetched on suggestion hover so selecting a result feels instant.
- The CREATE flow validates the date range and geocodes the location, then splits the
  range across Open-Meteo's archive endpoint (past) and forecast endpoint (future).
- The insights engine is deterministic rules over hourly data, not an LLM: cheap,
  instant, and explainable.
- SQLite was the original store; it hard-fails on Vercel's read-only serverless
  filesystem, so persistence moved to Supabase Postgres behind a least-privilege
  database role.

## Run it locally

```bash
git clone https://github.com/ronit-jitesh/weatherscope-pm-accelerator.git
cd weather
npm install
cp .env.example .env    # paste your Postgres connection string
npx prisma migrate deploy
npm run dev
```

The only environment variable is `DATABASE_URL` (any Postgres works; Supabase's
transaction pooler string is what production uses). Weather and maps need no keys.

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/geocode?query=` | GET | Resolve free text to coordinates (coordinate parse → Open-Meteo → Nominatim) |
| `/api/weather` | GET | Current + hourly + 7-day forecast |
| `/api/air-quality` | GET | PM2.5, PM10, EU/US AQI |
| `/api/records` | GET, POST | List and create weather records (Zod-validated) |
| `/api/records/[id]` | GET, PUT, DELETE | Read, update, delete a record |
| `/api/export?format=` | GET | Export records as json, csv, xml, markdown or pdf |

## Attribution

Weather data by [Open-Meteo](https://open-meteo.com) (CC BY 4.0). Map data
© [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, tiles © CARTO.
Geocoding fallback by Nominatim.
