# RailConnect AI — API Documentation

Base URL: `https://railconnect-ai-production.up.railway.app/api`

All responses are JSON. Errors follow:
```json
{ "success": false, "message": "..." }
```

---

## Health

### `GET /health`
- **Auth:** none
- **Response:** `{ "status": "ok", "service": "RailConnect AI Backend" }`

---

## Auth

### `POST /auth/register`
- **Auth:** none
- **Request:** `{ "name": "Nishanth", "email": "user@example.com", "password": "password123" }`
- **Response (201):** `{ "message": "Registration successful" }`

### `POST /auth/login`
- **Auth:** none
- **Request:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** `{ "token": "...", "user": { "id": 1, "name": "...", "email": "..." } }`
- Send the token as `Authorization: Bearer <token>` on subsequent requests.

---

## Trains

### `GET /trains/search?source=&destination=&date=`
- **Auth:** none
- Returns direct trains between two cities (used by the results page and as a building block for route planning).

### `GET /trains/:trainId/status`
- **Auth:** none
- Returns a demo on-time probability / typical delay for a train.

---

## Journey

### `POST /journey/plan`
- **Auth:** none
- **Request:** `{ "source": "Chennai", "destination": "Delhi", "date": "2026-09-20" }`
- Finds direct and multi-train routes, computes connection risk, ranks by safety score, and returns the top 3.
- **Response:**
```json
{
  "source": "Chennai",
  "destination": "Delhi",
  "date": "2026-09-20",
  "routes": [
    {
      "routeId": "R1", "id": "R1", "tag": "Recommended", "recommended": true,
      "safetyScore": 89, "riskLevel": "LOW",
      "duration": "23h 55m", "totalDuration": "23h 55m",
      "estimatedCost": 3200, "cost": 3200,
      "legs": [ { "trainNumber": "12433", "trainName": "Chennai Rajdhani", "source": "Chennai", "destination": "Delhi", "departureTime": "06:00", "arrivalTime": "05:55", "duration": "23h 55m" } ],
      "segments": [ /* same as legs */ ],
      "connections": [ { "station": "Hyderabad", "buffer": 90, "risk": { "score": 22, "level": "LOW", "buffer": 90, "recommendedBuffer": 70, "reasons": [] } } ],
      "overallSafety": { "overallScore": 89, "overallRisk": "LOW", "weakestConnection": "Hyderabad → Nagpur" }
    }
  ],
  "recommendation": { "routeId": "R1", "safetyScore": 89, "reason": "..." }
}
```

### `POST /journey/select`
- **Auth:** optional (attaches the journey to the logged-in user if a token is sent, otherwise tracked as a guest journey)
- **Request:** `{ "source": "Chennai", "destination": "Delhi", "date": "2026-09-20", "route": { ...one route object returned by /journey/plan } }`
- Persists the chosen route as a tracked journey with its segments.
- **Response (201):** `{ "journeyId": 1, "status": "active", "message": "Journey is now being tracked" }`

### `GET /journey/:id`
- **Auth:** none
- Returns the live view of a tracked journey: current train, next train, connection buffer/risk, remaining segments, and hospitality suggestions if the traveler is currently delayed/waiting.

### `POST /journey/:id/track`
- **Auth:** none
- Marks a planned journey as actively tracked (`status: active`).

### `POST /journey/:id/simulate-delay`
- **Auth:** none
- **Request:** `{ "delayMinutes": 135 }`
- Applies a delay to the currently active train segment, recalculates the next connection, and either:
  - confirms the connection still holds (returns the new buffer + recalculated risk), or
  - flags `connection_missed` with `recoveryAvailable: true`.
- **Response (missed):**
```json
{ "status": "connection_missed", "delay": 135, "message": "Connection at Hyderabad has been missed.", "recoveryAvailable": true }
```

---

## Risk

### `POST /risk/connection`
- **Auth:** none
- **Request:** `{ "bufferMinutes": 35, "trainNumber": "12771", "stationCity": "Nagpur" }`
- Runs the standalone connection-risk algorithm (useful for testing/tools).
- **Response:** `{ "score": 78, "level": "HIGH", "buffer": 35, "recommendedBuffer": 90, "reasons": [ "..." ] }`

---

## Recovery

### `POST /recovery/check`
- **Auth:** none
- **Request:** `{ "journeyId": 1, "trainId": 2, "actualArrival": "2026-09-20T12:45:00", "nextDeparture": "2026-09-20T11:30:00" }`
- **Response:** `{ "missed": true, "message": "The next connection has been missed.", "recoveryAvailable": true }`

### `POST /recovery/generate`
- **Auth:** none
- **Request:** `{ "journeyId": 1, "currentStation": "Hyderabad", "destination": "Delhi", "currentTime": "12:45", "budget": 2000 }`
- Finds alternative trains (direct + one-hop), ranks them by a safety-weighted composite score (prefers a safer option even if slightly slower/costlier), and builds hospitality + cost recommendations for the wait.
- **Response:**
```json
{
  "status": "recovered",
  "alternativeTrain": { "trainNumber": "12790", "trainName": "Hyderabad Rajdhani", "departure": "15:15", "arrival": "23:00" },
  "newJourney": [ /* leg objects */ ],
  "safetyScore": 88,
  "riskLevel": "LOW",
  "hospitality": { "hotel": {}, "food": {}, "transport": {} },
  "additionalCost": { "train": 2600, "hotel": 1400, "food": 350, "transport": 250, "total": 4600 },
  "updatedEstimatedCost": 7450,
  "reason": "..."
}
```

---

## Hospitality

### `GET /hospitality/:station?waitMinutes=&waitingTime=&budget=`
- **Auth:** none
- `waitMinutes` (minutes) or `waitingTime` (hours) — either works; `waitMinutes` takes priority.
- **Example:** `/api/hospitality/Hyderabad?waitMinutes=400&budget=1000`
- **Response:**
```json
{
  "station": "Hyderabad",
  "waitingTime": "6h 40m",
  "tier": "medium",
  "hotels": [], "restaurants": [], "transport": [], "attractions": []
}
```

---

## AI

### `POST /ai/recommend`
- **Auth:** none
- **Request:** `{ "routes": [ /* routes from /journey/plan */ ], "userBudget": 3000, "preferences": { "safeConnections": true, "lowCost": false } }`
- The AI explains and justifies a pick using the already-calculated safety scores/costs — it never invents its own risk numbers. Falls back to a deterministic explanation if `AI_API_KEY` isn't set.
- **Response:** `{ "recommendation": "R2", "explanation": "...", "keyReasons": [ "..." ] }`

### `POST /ai/explain-recovery`
- **Auth:** none
- **Request:** `{ "recoveryPlan": { /* the object returned by /recovery/generate */ } }`
- **Response:** `{ "explanation": "..." }`
