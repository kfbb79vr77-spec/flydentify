# Flydentify API Reference

Base URL (production): `https://flydentify.app`  
Base URL (development): `http://localhost:5000`

All endpoints return JSON. Authenticated endpoints require a valid session cookie established via `/api/auth/login`.

---

## Authentication

### POST /api/auth/register
Register a new user account. Starts a 7-day free trial.

**Body:**
```json
{
  "email": "angler@example.com",
  "password": "minimum-8-chars",
  "homeRegion": "Rocky Mountain / Intermountain"
}
```

**Response:** `201` user object (no password hash)

---

### POST /api/auth/login
Log in with email and password.

**Body:**
```json
{ "email": "angler@example.com", "password": "your-password" }
```

**Response:** `200` user object; sets session cookie

---

### POST /api/auth/logout
End the current session.

**Response:** `200 { "ok": true }`

---

### GET /api/auth/me
Return the currently authenticated user.

**Auth required:** Yes  
**Response:** `200` user object or `401`

---

## Conditions

### GET /api/conditions/river
Real-time river conditions from USGS National Water Information System.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `state` | string | 2-letter state abbreviation |
| `river` | string | River name |
| `lat` | number | Optional — latitude for nearest gauge |
| `lon` | number | Optional — longitude for nearest gauge |

**Response:** River conditions including flow (CFS), gauge height, temperature, trend, and recommendation.

---

### GET /api/conditions/tides
Tide predictions from NOAA CO-OPS.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lon` | number | Longitude |

**Response:** Tide station data with prediction schedule and current stage.

---

### GET /api/conditions/weather
Current weather and 7-day forecast from NOAA.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lon` | number | Longitude |

**Response:** Current conditions, hourly and daily forecast, wind, precipitation.

---

### GET /api/conditions/advisory
Weather and fishing advisory for a location.

**Query params:** `lat`, `lon`

**Response:** Advisory text, alert level, fishing recommendation.

---

## Streams (USGS)

### GET /api/streams/trout-states
List of US states with trout fisheries and their stream data.

**Response:** Array of state objects with stream counts and primary species.

---

### GET /api/streams/state/:abbr
All monitored streams for a given state.

**Path param:** `abbr` — 2-letter state abbreviation  
**Response:** Array of stream objects with USGS site numbers, names, and coordinates.

---

### GET /api/streams/nearby
Streams near a geographic coordinate.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lon` | number | Longitude |
| `radius` | number | Search radius in miles (default 25) |

**Response:** Array of nearby stream objects sorted by distance.

---

### GET /api/streams/detail/:siteNo
Detailed real-time data for a specific USGS gauge site.

**Path param:** `siteNo` — USGS site number  
**Response:** Current flow, stage, temperature, historical percentiles.

---

### GET /api/streams/search
Search streams by name or location keyword.

**Query params:** `q` — search string  
**Response:** Matching stream objects.

---

## Geocoding

### GET /api/geocode
Forward geocode a location string to coordinates.

**Query params:** `q` — location string  
**Response:** `{ lat, lon, displayName, state }`

---

### GET /api/reverse
Reverse geocode coordinates to a place name.

**Query params:** `lat`, `lon`  
**Response:** `{ displayName, state, county }`

---

## Hatch Reports

### GET /api/hatch-reports
Community hatch reports, optionally filtered.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `state` | string | 2-letter state abbreviation |
| `river` | string | River name filter |
| `insect` | string | Insect/hatch filter |

**Response:** Array of hatch report objects.

---

### GET /api/hatch-reports/recent
Most recent hatch reports across all locations.

**Response:** Array (up to 20) of recent hatch reports.

---

### POST /api/hatch-reports
Submit a community hatch report.

**Body:**
```json
{
  "state": "MT",
  "river": "Madison River",
  "insect": "PMD",
  "intensity": "moderate",
  "waterTemp": 54.5,
  "conditions": "Clear water, good visibility",
  "lat": 45.123,
  "lon": -111.456,
  "stage": "emerger",
  "waterClarity": "clear",
  "confidence": 80
}
```

**Response:** `201` created hatch report object.

---

## Fishing Reports (Saved Sessions)

### GET /api/reports
All saved fishing reports for the authenticated user.

**Auth required:** Yes  
**Response:** Array of fishing report objects.

---

### POST /api/reports
Save a fishing session report.

**Auth required:** Yes  
**Body:**
```json
{
  "location": "Gallatin River — Upper",
  "region": "Rocky Mountain / Intermountain",
  "date": "2026-09-15",
  "conditions": { "water_temp": 52, "clarity": "clear", "flow": "normal", "weather": "sunny" },
  "hatchObserved": ["PMD", "Caddis"],
  "flyRecommendations": [{ "name": "Parachute PMD", "size": 16, "confidence": 90 }],
  "notes": "Good morning action on emergers."
}
```

**Response:** `201` created report object.

---

### DELETE /api/reports/:id
Delete a fishing report.

**Auth required:** Yes  
**Response:** `200 { "ok": true }`

---

## Catch Reports

### GET /api/catch-reports
Catch reports, optionally filtered.

**Query params:** `state`, `river`, `species`  
**Response:** Array of catch report objects.

---

### GET /api/catch-reports/recent
Recent catch reports across the community.

**Response:** Array (up to 20) of recent catch reports.

---

### POST /api/catch-reports
Submit a catch report.

**Body:** Catch details including species, size, fly used, location, and optional GPS coordinates.  
**Response:** `201` created catch report object.

---

## Trip Plans

### GET /api/trip-plans
All trip plans for the authenticated user.

**Auth required:** Yes  
**Response:** Array of trip plan objects.

---

### POST /api/trip-plans
Create a trip plan.

**Auth required:** Yes  
**Body:** Trip destination, dates, target species, and notes.  
**Response:** `201` created trip plan object.

---

### DELETE /api/trip-plans/:id
Delete a trip plan.

**Auth required:** Yes  
**Response:** `200 { "ok": true }`

---

## Trip Kits

### GET /api/trip-kits
All trip kits (public + authenticated user's).

**Response:** Array of trip kit objects.

---

### GET /api/trip-kits/:id
Single trip kit by ID.

**Response:** Trip kit with flies list.

---

### POST /api/trip-kits
Create a trip kit.

**Body:** Kit name, target species, region.  
**Response:** `201` created trip kit object.

---

### DELETE /api/trip-kits/:id
Delete a trip kit.

**Response:** `200 { "ok": true }`

---

### POST /api/trip-kits/:id/flies
Add a fly to a trip kit.

**Body:** `{ "flyName": "Elk Hair Caddis", "size": 14, "quantity": 6 }`  
**Response:** `201` updated trip kit.

---

### DELETE /api/trip-kits/:id/flies/:flyId
Remove a fly from a trip kit.

**Response:** `200 { "ok": true }`

---

### PATCH /api/trip-kits/:id/notes
Update notes on a trip kit.

**Body:** `{ "notes": "string" }`  
**Response:** `200` updated trip kit.

---

## Waypoints

### GET /api/waypoints
All waypoints for the current user (session-based).

**Response:** Array of waypoint objects.

---

### POST /api/waypoints
Save a map waypoint.

**Body:**
```json
{
  "name": "Upper Run — Access Point",
  "lat": 45.123,
  "lon": -111.456,
  "notes": "Park at pullout mile marker 12"
}
```

**Response:** `201` created waypoint.

---

### DELETE /api/waypoints/:id
Delete a waypoint.

**Response:** `200 { "ok": true }`

---

## Places

### GET /api/places
Nearby lodging, restaurants, and fly shops via Google Places.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lon` | number | Longitude |
| `type` | string | `lodging` \| `restaurant` \| `fly_shop` |

**Response:** Array of place objects with name, address, rating, and distance.  
**Note:** Requires `GOOGLE_PLACES_KEY` environment variable.

---

## Guides and Fly Shops

### GET /api/guides
List fishing guides, optionally filtered by state.

**Query params:** `state`  
**Response:** Array of guide objects.

---

### GET /api/guides/:id
Single guide by ID.

**Response:** Guide detail object.

---

### GET /api/fly-shops
List fly shops, optionally filtered by state.

**Query params:** `state`  
**Response:** Array of fly shop objects.

---

## Content

### GET /api/articles
All editorial articles.

**Response:** Array of article summaries.

---

### GET /api/articles/:id
Single article by ID.

**Response:** Full article object.

---

### GET /api/rss
RSS feed of fishing news and articles.

**Response:** RSS XML.

---

### GET /api/stocking
Fish stocking reports, optionally filtered by state.

**Query params:** `state`  
**Response:** Array of stocking event objects.

---

## Newsletter / Waitlist

### POST /api/waitlist/join
Join the waitlist or subscribe to the newsletter.

**Body:** `{ "email": "angler@example.com", "region": "Southwest" }`  
**Response:** `201 { "ok": true }`

---

## Analytics

### POST /api/track
Log an anonymous usage event.

**Body:** `{ "event": "event_name", "properties": { ... } }`  
**Response:** `200 { "ok": true }`

---

## Voting

### POST /api/reports/:type/:id/upvote
Upvote a hatch report or catch report.

**Path params:** `type` — `hatch` | `catch`; `id` — report ID  
**Response:** `200 { "upvotes": number }`

---

## Admin (Protected)

All admin endpoints require the `Authorization: Bearer <ADMIN_TOKEN>` header.

### GET /api/admin/trial-nudges
List users in trial whose trial ends within 48 hours.

**Response:** Array of user objects with trial end times.

---

### POST /api/admin/trial-extend
Extend a user's trial period.

**Body:** `{ "userId": 123, "days": 3 }`  
**Response:** `200 { "ok": true }`

---

## Well-Known

### GET /.well-known/apple-app-site-association
Apple App Site Association file for Universal Links and deep linking.

**Response:** JSON per Apple AASA specification.
