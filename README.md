# Travelio

A browser-based travel planning tool. No backend, no account required — all data lives in your browser.

## What it does

Travelio guides you through two (soon three) phases of trip planning:

| Phase | Name | Description |
|---|---|---|
| 1 | Research | Import a CSV of destinations, browse, filter, sort, group, and select the places you want to visit |
| 2 | Map & Itinerary | See selected places on an interactive map, arrange them into a day-by-day itinerary via drag-and-drop |
| 3 | *(coming soon)* | TBD |

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

To try it with sample data, use **Import CSV** and load `public/sample.csv` (65 destinations across 14 regions).

## Tech stack

| Purpose | Library |
|---|---|
| Build | Vite + React 18 |
| Map | react-leaflet + Leaflet |
| Geocoding | Nominatim (OpenStreetMap) — rate-limited, cached |
| CSV parse/export | PapaParse |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |
| State | React Context + useReducer |
| Persistence | localStorage |
| Styling | CSS Modules |

## CSV format

The expected columns are:

| Column | Description |
|---|---|
| `region` | Broad region (e.g. "Northern Italy") |
| `city` | City or area name |
| `title` | Name of the activity or place |
| `description` | Short description |
| `time` | Estimated visit duration (e.g. "1.5 hours") |

Latitude and longitude are resolved automatically via geocoding when you enter Phase 2. You can manually correct any inaccurate coordinates from the row editor.

## Project structure

```
src/
  components/
    layout/       # PhaseNav top bar
    phase1/       # ResearchTable, RowEditor
    phase2/       # MapView, ItineraryPanel, ActivityCard
    phase3/       # Placeholder
  context/
    PlannerContext.jsx   # global state (useReducer + localStorage)
  hooks/
    useCsvIO.js          # import/export helpers
    useGeocoding.js      # Nominatim geocoding with cache
  utils/
    csvSchema.js         # column definitions and default row shape
public/
  sample.csv             # bundled sample destination data
```

## Planned features

- Export itinerary to PDF, CSV, JSON, and Markdown
- Export locations as a KML file for Google Maps / My Maps import
- Drag-and-drop CSV file import
- Sort and group Research table by Region, City, or Time
- Marker clustering on the map
- Geocoding review UI for manual lat/lng correction
- Mobile-responsive layout
- Undo/redo
