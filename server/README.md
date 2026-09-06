# RailConnect AI — Backend

Intelligent multi-train journey management backend: route search, connection-risk
scoring, AI-explained recommendations, live delay simulation, and missed-connection
recovery planning (alternative trains + hotel/food/transport + cost).

All train/station/hotel/restaurant data in `data/*.json` is **fictional prototype
data** for the hackathon demo — not sourced from a live railway API.

## 1. Install

```bash
cd server
npm install
```

## 2. MySQL setup

Make sure MySQL is running locally, then create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `railconnect` database and all required tables
(`users`, `trains`, `stations`, `journeys`, `journey_segments`,
`delay_events`, `recovery_plans`, `hospitality_options`).

## 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=railconnect
JWT_SECRET=change_this_in_production
AI_API_KEY=            # optional - leave blank to use the deterministic fallback explainer
AI_MODEL=claude-sonnet-4-6
CORS_ORIGIN=http://localhost:5173
```

Never commit `.env` — it's already in `.gitignore`.

## 4. Seed the database

```bash
npm run seed
```

This loads `data/trains.json`, `data/stations.json`, `data/hotels.json` and
`data/restaurants.json` into MySQL (30+ trains, 10 stations, 15 hotels,
13 restaurants, plus generic transport options per station).

## 5. Start the server

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```

The API is now live at `http://localhost:5000`. Check it with:

```bash
curl https://railconnect-ai-production.up.railway.app/api/health
```

## 6. Try the demo flow

```bash
# 1. Plan a journey
curl -X POST https://railconnect-ai-production.up.railway.app/api/journey/plan \
  -H "Content-Type: application/json" \
  -d '{"source":"Chennai","destination":"Delhi","date":"2026-09-20"}'

# 2. Select/track a route (copy one "route" object from the response above)
curl -X POST https://railconnect-ai-production.up.railway.app/api/journey/select \
  -H "Content-Type: application/json" \
  -d '{"source":"Chennai","destination":"Delhi","date":"2026-09-20","route": { ...paste route here... }}'

# 3. View the live journey
curl https://railconnect-ai-production.up.railway.app/api/journey/1

# 4. Simulate a big delay to trigger a missed connection
curl -X POST https://railconnect-ai-production.up.railway.app/api/journey/1/simulate-delay \
  -H "Content-Type: application/json" \
  -d '{"delayMinutes": 135}'

# 5. Generate a recovery plan
curl -X POST https://railconnect-ai-production.up.railway.app/api/recovery/generate \
  -H "Content-Type: application/json" \
  -d '{"journeyId":1,"currentStation":"Hyderabad","destination":"Delhi","currentTime":"12:45","budget":2000}'
```

Full endpoint reference: see `API.md`.

## 7. Connecting the React frontend

- Set `CORS_ORIGIN` in `.env` to your frontend's dev URL (defaults to
  `http://localhost:5173`, matching Vite's default port).
- Replace the mock imports in your frontend (`src/data/routes.js`, etc.) with
  `fetch` calls to the endpoints in `API.md` — the JSON shapes were built to
  match your existing mock data shapes (`legs`, `connections`, `tag`,
  `reliability`, `totalDuration`, `cost`, plus a top-level `recommendation`
  object) so the UI changes should be minimal.
- No frontend code should call any external train API directly — always go
  through this backend (see `services/trainService.js`, which is the single
  swap point for plugging in a real railway API later).

## Project structure

```
server/
├── server.js              # Express app entrypoint
├── config/db.js           # MySQL connection pool
├── routes/                # thin Express routers
├── controllers/           # request/response handling + validation
├── services/               # all business logic (route search, risk, recovery, cost, hospitality, AI)
├── middleware/authMiddleware.js
├── utils/                 # time + scoring helpers
├── data/                  # seed JSON (trains, stations, hotels, restaurants)
├── database/schema.sql    # table definitions
├── database/seed.js       # loads data/*.json into MySQL
└── API.md                 # full endpoint reference
```

## Notes / known simplifications (hackathon scope)

- Multi-day journeys: segment departure/arrival times are stored by combining
  the travel date with each leg's clock time; overnight rollovers aren't
  bumped to the next calendar date. Fine for a demo, would need proper
  date-rollover handling for production.
- `AI_API_KEY` is optional. Without it, `/api/ai/recommend` and
  `/api/ai/explain-recovery` use a deterministic explanation generator built
  from the same calculated numbers, so the demo works end-to-end with zero
  external dependencies.
