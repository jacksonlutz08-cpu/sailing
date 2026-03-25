# BlueHorizon API Documentation

## Overview

BlueHorizon uses a mix of external APIs and internal endpoints. This document describes all integrations required.

---

## 🔐 Internal APIs (Next.js Routes)

### POST `/api/sync/vault`
Sync encrypted documents from client IndexedDB to Supabase.

**Request:**
```json
{
  "documents": [
    {
      "id": "doc_123",
      "userId": "user_456",
      "type": "passport",
      "encryptedBlob": "base64_ciphertext",
      "iv": "base64_iv",
      "expiry_date": "2026-12-31",
      "country_tags": ["AU", "NZ", "FJ"]
    }
  ]
}
```

**Response:**
```json
{
  "synced": 1,
  "message": "Vault synced successfully",
  "errors": []
}
```

**Implementation:** `app/api/sync/vault/route.ts`

---

### POST `/api/sync/logbook`
Sync low-bandwidth logbook entries (delta-sync format).

**Request:**
```json
{
  "entries": [
    {
      "timestamp": "2026-03-24T14:30:00Z",
      "gps_lat": -17.5,
      "gps_lon": 178.1,
      "wind_speed": 12,
      "wind_direction": 45,
      "depth_meters": 25.5
    }
  ]
}
```

**Response:**
```json
{
  "synced": 5,
  "message": "Logbook synced successfully"
}
```

**Implementation:** `app/api/sync/logbook/route.ts`

---

### GET `/api/country-requirements`
Fetch 200+ country document requirements (cached).

**Response:**
```json
[
  {
    "country_code": "AU",
    "country_name": "Australia",
    "required_documents": ["passport", "registration", "insurance", "customs"],
    "special_notes": "Biosecurity declaration required",
    "port": "Sydney"
  }
]
```

**TODO:** Implement in `app/api/country-requirements/route.ts`

---

### PUT `/api/maintenance/{partId}`
Update maintenance record with new service hours.

**Request:**
```json
{
  "lastServiceHours": 500,
  "nextServiceDate": "2026-06-30"
}
```

**Response:**
```json
{
  "id": "part_123",
  "message": "Maintenance record updated"
}
```

**TODO:** Implement in `app/api/maintenance/[id]/route.ts`

---

## 🌊 External APIs

### StormGlass Tide API

Provides harmonic tide predictions for safe harbor entry windows.

**Endpoint:** `https://api.stormglass.io/v2/tide/extremes`

**Parameters:**
```
lat=<latitude>
lng=<longitude>
start=<ISO_8601_timestamp>
```

**Example:**
```bash
curl -H "Authorization: Bearer JF7yNw16veAvcvxaWIqj3Brrf67BFhudjGxTGbPz" \
  "https://api.stormglass.io/v2/tide/extremes?lat=-17.5&lng=178.1&start=2026-03-24T00:00:00Z"
```

**Response:**
```json
{
  "data": [
    {
      "time": "2026-03-24T07:45:00Z",
      "height": 2.5,
      "type": "high"
    },
    {
      "time": "2026-03-24T14:30:00Z",
      "height": 0.8,
      "type": "low"
    }
  ]
}
```

**Implementation:** 
- Create `lib/tides/stormglass.ts`
- Cache results to avoid API overages

**Pricing:** ~$100/month for 1000 requests/day

**Alternative:** World Tides API (https://www.worldtides.info)

### NOAA Tides & Currents API

Free, government-run tide station data for US coastal waters. Provides real-time and predicted water levels.

**Stations Endpoint:** `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.xml?type=waterlevels&units=english`

**Parameters:**
```
type=waterlevels  # Station type
units=english     # Feet/meters
```

**Example:**
```bash
curl "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.xml?type=waterlevels&units=english"
```

**Response:** XML format with station metadata
```xml
<Stations>
  <Station>
    <ID>9414290</ID>
    <Name>San Francisco</Name>
    <Lat>37.8063</Lat>
    <Lng>-122.4659</Lng>
    <State>CA</State>
  </Station>
  <!-- ... more stations ... -->
</Stations>
```

**Tide Data Endpoint:** `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS_COOPS&begin_date={YYYYMMDD}&end_date={YYYYMMDD}&datum=MLLW&station={STATION_ID}&time_zone=gmt&units=english&interval=h&format=json`

**Application ID:** Use `51222fca-27c3-11f1-beac-0242ac120004-51223088-27c3-11f1-beac-0242ac120004` (provided by NOAA for BlueHorizon)

**Example:**
```bash
curl "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=51222fca-27c3-11f1-beac-0242ac120004-51223088-27c3-11f1-beac-0242ac120004&begin_date=20260324&end_date=20260325&datum=MLLW&station=9414290&time_zone=gmt&units=english&interval=h&format=json"
```

**Response:**
```json
{
  "predictions": [
    {
      "t": "2026-03-24 00:00",
      "v": "2.345"
    },
    {
      "t": "2026-03-24 01:00",
      "v": "2.123"
    }
  ]
}
```

**Implementation:**
- Create `lib/tides/noaa.ts`
- Cache station list (updates infrequently)
- Cache tide predictions for 24 hours
- Fallback to StormGlass for international waters

**Pricing:** Free (government API)

---

### ExchangeRate-API (Forex)

Real-time currency conversion for port fees and fuel prices.

**Endpoint:** `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{base_currency}`

**Example:**
```bash
curl "https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/AUD"
```

**Response:**
```json
{
  "base": "AUD",
  "date": "2026-03-24",
  "conversion_rates": {
    "USD": 0.65,
    "EUR": 0.58,
    "GBP": 0.51,
    "FJD": 1.48,
    "XPF": 70.5,
    "NZD": 1.08
  }
}
```

**Implementation:**
- Create `lib/forex/rates.ts`
- Cache for 1 hour to minimize API calls
- Store historical rates for budget tracking

**Pricing:** ~$10/month for free tier (1500 requests/month)

---

### OpenWeatherMap (Wind Forecasts)

Optional: Provide wind forecast for harbor entry planning.

**Endpoint:** `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}`

**Example:**
```bash
curl "https://api.openweathermap.org/data/2.5/forecast?lat=-17.5&lon=178.1&appid=YOUR_API_KEY"
```

**Response:**
```json
{
  "list": [
    {
      "dt": 1711270800,
      "wind": {
        "speed": 12,
        "deg": 45
      }
    }
  ]
}
```

**Implementation:** Optional for Phase 2

---

### Supabase API (Database)

BlueHorizon's main backend.

**Base URL:** `https://your-project.supabase.co`

**Authentication:** Bearer token from `supabase.auth.session().access_token`

**Create Client:**
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Example: Insert Vault Document**
```typescript
const { data, error } = await supabase
  .from("vault")
  .insert([
    {
      user_id: user.id,
      type: "passport",
      encrypted_blob: encryptedData,
      expiry_date: "2026-12-31",
      country_tags: ["AU", "NZ"]
    }
  ]);
```

**Real-Time Subscriptions:**
```typescript
supabase
  .from("maintenance")
  .on("*", payload => {
    console.log("Change received!", payload);
  })
  .subscribe();
```

---

## 📡 Signal K Integration (NMEA 2000)

Connect to boat's Signal K gateway for real-time vessel data.

**WebSocket Endpoint:** `ws://192.168.1.100:3000/signalk/v1/stream`

**Example Connection:**
```typescript
const ws = new WebSocket("ws://boat-gateway:3000/signalk/v1/stream");

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  message.updates.forEach(update => {
    update.values.forEach(value => {
      if (value.path === "propulsion.mainEngine.runTime") {
        console.log("Engine runtime:", value.value, "hours");
      }
    });
  });
};
```

**Example Message:**
```json
{
  "context": "vessels.self",
  "updates": [
    {
      "timestamp": "2026-03-24T14:30:00.000Z",
      "source": "nmea2000.32",
      "values": [
        {
          "path": "propulsion.mainEngine.runTime",
          "value": 450
        },
        {
          "path": "propulsion.mainEngine.temperature",
          "value": 320.15
        },
        {
          "path": "navigation.position",
          "value": {
            "latitude": -17.5,
            "longitude": 178.1
          }
        },
        {
          "path": "environment.wind.speedTrue",
          "value": 6.2
        }
      ]
    }
  ]
}
```

**Implementation:** 
- Create `lib/signalk/gateway.ts`
- Parse and validate incoming data
- Store in IndexedDB for offline access
- Sync to Supabase when online

**Required Gateway:** NaviGator, OpenPlotter, or Signal K server

---

## 🗺️ Port Data Service (Optional)

Enhance port intelligence with real-time data.

**Cruising Routes API (if available):**
- Current port fees
- Dockage prices
- Fuel prices
- Local customs contacts

**Implementation:** Partner integration (Phase 2+)

---

## 🔑 API Keys Management

Store all API keys as environment variables:

**.env.local (development):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=11e033ec-0bbf-4d0b-a8d8-531bbc61a7c7

NEXT_PUBLIC_STORMGLASS_API_KEY=JF7yNw16veAvcvxaWIqj3Brrf67BFhudjGxTGbPz
NEXT_PUBLIC_EXCHANGERATE_API_KEY=your_key_here
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_key_here

SUPABASE_SERVICE_ROLE_KEY=your_service_key (server-only)
```

**Vercel (production):**
- Settings → Environment Variables
- Add all keys
- Ensure `NEXT_PUBLIC_*` is available to client
- Server-only keys not exposed to frontend

---

## 🚨 Error Handling

All external API calls should handle failures gracefully:

```typescript
async function fetchTides(lat, lon) {
  try {
    const response = await fetch(stormglassUrl);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("[Tides] API call failed:", error);
    
    // Fall back to cached data
    const cached = await getCachedTides(lat, lon);
    if (cached) {
      return cached;
    }
    
    // If no cache, return sensible defaults
    throw new Error("Tides unavailable (offline + no cache)");
  }
}
```

---

## 📊 Rate Limiting

To avoid API overages:

**StormGlass:**
- Cache tide data for 1 day per location
- Max 1 request per location per sync cycle

**ExchangeRate-API:**
- Cache rates for 1 hour
- Request only when user creates budget leg

**OpenWeatherMap:**
- Cache forecasts for 3 hours
- Optional feature, not critical

---

## 🔐 CORS & Security

Client-side API calls must handle CORS:

```typescript
// ❌ Direct client → StormGlass breaks CORS
const response = await fetch("https://api.stormglass.io/...");

// ✅ Use server-side proxy
const response = await fetch("/api/tides?port=suva");
```

**Server-side proxy in `app/api/tides/route.ts`:**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const port = searchParams.get("port");
  
  const response = await fetch(
    `https://api.stormglass.io/v2/tide/extremes?...`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STORMGLASS_API_KEY}`
      }
    }
  );
  
  return Response.json(await response.json());
}
```

---

## 📈 Monitoring API Usage

Use Supabase dashboard to monitor:
- Database rows stored
- Storage used
- Real-time message count

Set alerts for:
- Storage > 80% capacity
- Database queries > 100k/day

---

## 🧪 Testing External APIs

**Mock APIs for development:**
```typescript
// lib/mockData.ts
export const MOCK_TIDE_WINDOWS = [
  { port: "Suva, Fiji", safeEntryStart: ... }
];

export const MOCK_EXCHANGE_RATES = {
  AUD: 1.0,
  USD: 0.65
};
```

**Feature flags to toggle real vs. mock:**
```typescript
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const tides = useMockData ? MOCK_TIDES : await fetchFromStormGlass();
```

---

## 📞 API Support Links

- **Supabase**: https://supabase.com/docs/reference/javascript
- **StormGlass**: https://stormglass.io/reference
- **ExchangeRate-API**: https://www.exchangerate-api.com/docs
- **OpenWeatherMap**: https://openweathermap.org/forecast5
- **Signal K**: https://signalk.org

---

**Last Updated:** March 2026

**Next Priority:** Implement Supabase RLS + authentication
