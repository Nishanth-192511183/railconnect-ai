# RailConnect AI — Frontend Prototype

Intelligent multi-train journey planning: route comparison, connection risk,
live delay simulation, AI recovery planning, and hospitality recommendations.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Demo flow

Home → Plan Journey → Compare 3 routes → View Journey → My Journey (Live
Dashboard) → Simulate 2 Hour Delay → Connection Missed → Recovery page →
View Updated Journey → Hospitality recommendations.

## Structure

- `src/data/` — mock trains, routes, stations, hotels, restaurants
- `src/context/JourneyContext.jsx` — shared journey state (selected route,
  delay/recovery status) used across pages
- `src/components/` — reusable UI building blocks
- `src/pages/` — the six app pages, wired with React Router
