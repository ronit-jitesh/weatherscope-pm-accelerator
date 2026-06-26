# WeatherScope — Full-Stack Weather Intelligence App

> **PM Accelerator AI Engineer Intern Technical Assessment — Full Stack (Assessment #1 + #2)**  
> Built by **Ronit Jitesh** · [s2889071@ed.ac.uk](mailto:s2889071@ed.ac.uk)

---

## What This App Does

WeatherScope is a production-quality full-stack weather application that covers **both** Tech Assessment #1 (frontend) and Tech Assessment #2 (backend). It lets users search any location, get real-time weather data, and manage a persistent database of weather records with full CRUD operations and multi-format data export.

### Assessment Coverage

| Requirement | Status | Implementation |
|---|---|---|
| Flexible location input | ✅ | City/town, zip/postal, GPS coords (`lat,lon`), landmarks via Nominatim fallback |
| Current weather + details | ✅ | Temperature, feels-like, humidity, wind, pressure, cloud cover, UV, precip prob |
| Browser geolocation | ✅ | `navigator.geolocation` → auto-resolves to nearest city |
| Weather icons | ✅ | Emoji-based WMO code mapping (100% coverage, no external CDN) |
| 5-day (7-day) forecast | ✅ | Responsive grid showing max/min/precip/UV per day |
| Error handling | ✅ | Invalid location, API failure, coordinate out-of-range — all user-facing |
| Responsive design | ✅ | Tailwind CSS breakpoints: stacks on mobile, grid on tablet/desktop |
| CREATE + validation | ✅ | Date range validation (start < end, max 365 days, 1940–today+16) + location geocoding validation |
| READ all records | ✅ | Table with expandable daily data, no row-level auth needed |
| UPDATE records | ✅ | Re-validates location + dates on edit, re-fetches weather data |
| DELETE records | ✅ | Confirmation modal before deletion |
| Export formats | ✅ | JSON, CSV, XML, Markdown, PDF — all via `/api/export?format=` |
| Stand-apart API (Map) | ✅ | Interactive Leaflet + OpenStreetMap map — pan/zoom, no API key |
| Stand-apart (AQI) | ✅ | Open-Meteo Air Quality API: PM2.5, PM10, European AQI, US AQI |
| Non-obvious features | ✅ | "What to Pack/Wear" advisory driven by feels-like, UV, precip, wind, weather code |

---

## Non-Obvious Traveller Features

The "What to Pack" advisory answers the rubric's hint: *"what should a traveller consider that might not be obvious?"*

- **Feels-like temperature** (not just the reading) determines clothing layers
- **UV index** (from WHO thresholds) triggers sunscreen and hat recommendations
- **Precipitation probability** (not just current rain) triggers umbrella/rain gear
- **Wind speed gusts** trigger windbreaker or windproof coat
- **Sunrise/sunset** displayed for daylight planning across timezones
- **Air Quality Index** (PM2.5, PM10, EU AQI) for health-conscious travellers

All derived from the same Open-Meteo API call — zero extra cost, high perceived intelligence.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Full-stack in one project; Server Actions and API routes |
| Styling | Tailwind CSS | Utility-first, responsive by default |
| Database | SQLite via `@libsql/client` | Zero infrastructure for the demo; swap for Postgres with one line |
| ORM | Prisma v7 | Type-safe queries, painless migrations, Studio viewer |
| Weather API | Open-Meteo | No API key, no credit card; forecast + ERA5 archive back to 1940 |
| Geocoding | Open-Meteo Geocoding + Nominatim | City/postal/coord support; Nominatim for landmarks |
| Map | React-Leaflet + OpenStreetMap | No billing account; MIT licensed; interactive pan/zoom |
| Validation | Zod | Schema-first validation on both API input and CRUD forms |
| Export | papaparse (CSV) + xmlbuilder2 (XML) + pdfkit (PDF) | Lightest reliable option per format |

---

## API Choices & Tradeoffs

**Why Open-Meteo over OpenWeatherMap/WeatherAPI?**  
The CREATE requirement asks for historical temperature over a date range. OpenWeatherMap charges for history (credit card required). Open-Meteo provides free ERA5 archive back to 1940 with no key, no sign-up, no card. Rate limits: <10,000 calls/day, 5,000/hour, 600/minute.

**Why Leaflet over Google Maps?**  
Google Maps JavaScript API requires a billing account. Leaflet + OpenStreetMap is MIT-licensed with no key, no account, and no billing — and looks identical in a demo.

**Alternative if you need commercial rights:** Visual Crossing Timeline API (1,000 calls/day free, commercial license included, unified past+future endpoint).

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
git clone <repo-url>
cd weather
npm install
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

No API keys are required. The `.env` file only configures the local SQLite database path:

```
DATABASE_URL="file:./prisma/dev.db"
```

### Switching to Postgres/Supabase

1. Update `prisma/schema.prisma` datasource provider to `postgresql`
2. Update `prisma.config.ts` with your Supabase connection string
3. Update `lib/prisma.ts` to use `@prisma/adapter-pg` or `@prisma/adapter-neon`
4. Run `npx prisma migrate dev`

---

## API Reference

| Route | Method | Description |
|---|---|---|
| `/api/geocode?query=` | GET | Resolve location string → lat/lon (coord detect → Open-Meteo → Nominatim fallback) |
| `/api/weather?latitude=&longitude=` | GET | Current weather + 7-day forecast from Open-Meteo |
| `/api/air-quality?latitude=&longitude=` | GET | PM2.5, PM10, EU AQI, US AQI |
| `/api/records` | GET | List all stored weather records |
| `/api/records` | POST | Create record: validate location + dates → fetch data → store |
| `/api/records/[id]` | GET | Get single record |
| `/api/records/[id]` | PUT | Update record (re-validates location/dates if changed) |
| `/api/records/[id]` | DELETE | Delete record |
| `/api/export?format=json|csv|xml|markdown|pdf` | GET | Export all records (or `&id=` for single) |

---

## Project Structure

```
app/
  api/
    geocode/route.ts      — Location resolution
    weather/route.ts      — Current + forecast
    air-quality/route.ts  — AQI
    records/route.ts      — CRUD list + create
    records/[id]/route.ts — CRUD single
    export/route.ts       — Multi-format export
  page.tsx                — Main weather page
  history/page.tsx        — CRUD history page
components/
  SearchBar.tsx           — Debounced search + geolocation
  CurrentWeather.tsx      — Hero weather card
  ForecastGrid.tsx        — 7-day responsive grid
  WeatherMap.tsx          — Leaflet map (dynamic SSR-safe import)
  PackingAdvisory.tsx     — "What to pack" advisory
  AirQualityCard.tsx      — AQI display
  SaveRecordModal.tsx     — Date range selector + DB save
  HistoryTable.tsx        — Full CRUD table with inline edit
  ExportButtons.tsx       — Format download buttons
  AboutPMA.tsx            — PM Accelerator section
lib/
  prisma.ts               — Prisma client singleton
  geocode.ts              — Location resolution logic
  weather.ts              — Open-Meteo API wrappers
  wmo-codes.ts            — WMO weather code → emoji/description
  packing-advisory.ts     — Deterministic packing rules engine
  export.ts               — CSV/XML/PDF/Markdown generators
types/
  weather.ts              — Shared TypeScript types
prisma/
  schema.prisma           — WeatherRecord model
  dev.db                  — SQLite database (auto-created on migrate)
```

---

## Attribution

- Weather data: [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0)
- Map data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Geocoding fallback: [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org)

---

*Built for PM Accelerator AI Engineer Intern Technical Assessment — Full Stack*  
*Ronit Jitesh · June 2026*
