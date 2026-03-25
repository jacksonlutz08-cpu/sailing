# BlueHorizon Development Guide

This document provides implementation details and extension guidelines for developers contributing to the BlueHorizon project.

---

## 🔒 Secure Vault Module Implementation

### Objective
Create an offline-capable document vault with client-side AES-256 encryption. Documents are encrypted before leaving the device; Supabase only stores ciphertext.

### Key Files
- `lib/crypto/encryption.ts` - Web Crypto API utilities
- `modules/vault/components/VaultStatus.tsx` - Dashboard widget
- `app/vault/page.tsx` - Full vault page
- `app/api/sync/vault/route.ts` - Server sync endpoint

### Encryption Flow

```typescript
// 1. User enters master passphrase (only on login)
const userPassword = "my_secure_passphrase";
const salt = generateSalt();

// 2. Derive strong key using PBKDF2
const masterKey = await deriveKeyFromPassword(userPassword, salt);

// 3. Encrypt document before upload
const plaintext = documentBlob.text(); // PDF content
const encrypted = await encryptData(plaintext, masterKey);
// Result: { ciphertext, iv, salt }

// 4. Store in IndexedDB for offline access
await saveEncryptedDocument(docId, {
  type: "passport",
  encrypted: encrypted.ciphertext,
  iv: encrypted.iv,
  expiry: "2026-12-31",
  countryTags: ["AU", "NZ"]
});

// 5. When online, sync to Supabase
await fetch("/api/sync/vault", {
  method: "POST",
  body: JSON.stringify({ documents: [encrypted] })
});
```

### Gap Analysis Algorithm

Country requirements are stored as JSON in the database:

```sql
SELECT 
  c.country_code,
  c.required_documents,
  (
    SELECT ARRAY_AGG(dt.type) 
    FROM vault dt 
    WHERE dt.user_id = $1 
    AND dt.expiry_date > NOW()
  ) as user_documents
FROM country_requirements c
WHERE c.country_code = $2;
```

The frontend then maps:
```typescript
const missing = required.filter(r => !userDocuments.includes(r));
const valid = required.filter(r => userDocuments.includes(r));
```

### PDF Generation (Clearance Pack)

Using PDF-lib to pre-fill government forms:

```typescript
import { PDFDocument, rgb } from 'pdf-lib';

async function generateClearancePack(
  userProfile: User,
  countryCode: string
) {
  // Load country-specific template PDF
  const pdfUrl = `/templates/clearance_${countryCode}.pdf`;
  const pdfBytes = await fetch(pdfUrl).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Get form fields and pre-fill
  const form = pdfDoc.getForm();
  form.getTextField('passenger_name').setText(userProfile.name);
  form.getTextField('passport_number').setText(userProfile.passportNumber);
  form.getTextField('boat_length').setText(userProfile.boatLength.toString());
  
  // Save and return
  return pdfDoc.save();
}
```

### TODO: Next Steps for Vault
1. Create PDF templates for major countries (AU, NZ, FJ, US)
2. Implement document upload handler
3. Add expiry date management
4. Create "Export Clearance Pack" button flow
5. Integrate StormGlass API for document recommendations

---

## ⚙️ Vessel Heartbeat Module Implementation

### Objective
Ingest real-time vessel data from Signal K gateway. Trigger maintenance alerts based on engine runtime thresholds.

### Key Files
- `modules/heartbeat/components/VesselStatus.tsx` - Dashboard widget
- `app/heartbeat/page.tsx` - Full heartbeat page
- `lib/mockData.ts` - Maintenance mock data

### Signal K WebSocket Integration (TODO)

Signal K is an open marine software standard. Connect via:

```typescript
// lib/signalk/gateway.ts (to implement)

const signalKUrl = "ws://192.168.1.100:3000/signalk/v1/stream";
const ws = new WebSocket(signalKUrl);

ws.onmessage = async (event) => {
  const signalKMessage = JSON.parse(event.data);
  
  // Extract engine data
  const engineRunTime = signalKMessage.updates[0].values
    .find(v => v.path === "propulsion.mainEngine.runTime").value;
  
  // Store in IndexedDB for offline access
  await logEntry({
    timestamp: new Date(),
    engineRunTime,
    gps: { lat, lon },
    wind: { speed, direction },
    depth
  });
  
  // Check maintenance thresholds
  checkMaintenanceAlerts(engineRunTime);
};
```

### Maintenance Alert Logic

```typescript
interface MaintenanceRecord {
  partName: string;
  lastServiceHours: number;
  intervalHours: number;
  stockLevel: number;
  nextServiceDue: number; // calculated
}

function checkMaintenanceAlerts(currentEngineHours: number) {
  const records = getMaintenance();
  
  records.forEach(record => {
    const nextService = record.lastServiceHours + record.intervalHours;
    const hoursRemaining = nextService - currentEngineHours;
    
    // Alert thresholds
    if (hoursRemaining === 100) {
      pushNotification("Oil change needed in 100 hours");
    }
    if (hoursRemaining === 50 && record.stockLevel === 0) {
      pushNotification("⚠️ CRITICAL: Oil filter out of stock!");
    }
  });
}
```

### TODO: Next Steps for Heartbeat
1. Create Signal K gateway connection handler
2. Parse NMEA 2000 data streams
3. Implement push notifications
4. Add maintenance expense tracking
5. Create "Spares Needed" shopping list

---

## 🌊 Arrival Assistant Module Implementation

### Objective
Calculate safe harbor entry windows using tide forecasts. Prevent groundings.

### Key Files
- `modules/arrival/components/ArrivalAssistant.tsx` - Dashboard widget
- `app/arrival/page.tsx` - Full arrival page

### Port Database Integration (NGA World Port Index)

The Arrival Assistant now includes a comprehensive port database scraped from the NGA World Port Index.

#### Database Schema
- **Table:** `ports` in Supabase PostgreSQL
- **Key Fields:** port_id, port_name, country, latitude, longitude, harbor_type, max_draft, facilities
- **Indexes:** Full-text search on name/country, spatial queries for nearby ports

#### Scraping Implementation
```typescript
// lib/scrapers/nga-ports.ts
import NGAPortScraper from '../lib/scrapers/nga-ports.js';

const scraper = new NGAPortScraper();
const ports = await scraper.scrapePorts();
await scraper.storePorts(ports);
```

#### API Endpoints
- `GET /api/ports/search?q=antigua` - Search ports by name
- `GET /api/ports/nearby?lat=17.1&lng=-61.8&radius=50` - Find nearby ports
- `GET /api/ports` - List all ports (paginated)

#### Usage in Component
```typescript
// Search for ports
const response = await fetch(`/api/ports/search?q=${query}`);
const { ports } = await response.json();

// Display port information
{selectedPort && (
  <div>
    <h3>{selectedPort.port_name}, {selectedPort.country}</h3>
    <p>Max Draft: {selectedPort.max_draft}m</p>
    <p>Facilities: {selectedPort.facilities.join(', ')}</p>
  </div>
)}
```

### Tide Data Integration (StormGlass or World Tides API) (TODO)

```typescript
// lib/tides/forecast.ts (to implement)

async function getTideWindow(
  port: string,
  boatDraft: number,
  safetyMargin: number = 0.6 // 2 feet
): Promise<TideWindow> {
  // Fetch from StormGlass API
  const response = await fetch(
    `https://api.stormglass.io/v2/tide/extremes?lat=${lat}&lng=${lon}`,
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );
  
  const tides = await response.json();
  
  // Find safe entry window
  // Condition: (Tide_Height + Charted_Depth) > (Boat_Draft + Safety_Margin)
  
  const safeWindow = tides.data.find(tide => {
    const availableDepth = tide.height + chartedDepth;
    const requiredDepth = boatDraft + safetyMargin;
    return availableDepth > requiredDepth;
  });
  
  if (!safeWindow) {
    return { isSafe: false, reason: "Not enough water for safe entry" };
  }
  
  return {
    port,
    safeEntryStart: new Date(safeWindow.time),
    safeEntryEnd: new Date(safeWindow.time + 3 * 60 * 60 * 1000),
    predictedHeight: safeWindow.height,
    boatDraft,
    safetyMargin
  };
}
```

### Tide Curve Visualization (Using Recharts)

```typescript
// modules/arrival/components/TideCurve.tsx (to implement)

import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function TideCurve({ tideData, safeWindow }) {
  return (
    <LineChart width={400} height={300} data={tideData}>
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="height" stroke="#3b82f6" />
      
      {/* Highlight safe entry window in green */}
      <ReferenceDot
        x={safeWindow.start}
        fill="green"
        r={5}
      />
      <ReferenceDot
        x={safeWindow.end}
        fill="red"
        r={5}
      />
    </LineChart>
  );
}
```

### Current & Wind Analysis (TODO)

To detect dangerous "wind-against-tide" conditions:

```typescript
function analyzeSeaState(
  windSpeed: number,
  windDirection: number,
  currentSpeed: number,
  currentDirection: number
): SeaState {
  // If wind and current are opposite, seas will be steeper/rougher
  const angleDifference = Math.abs(windDirection - currentDirection);
  
  if (angleDifference > 150 && windSpeed > 12 && currentSpeed > 1) {
    return {
      status: "ROUGH",
      message: "Wind against tide - expect steep, confused seas",
      recommendation: "Wait for tide turn or seek alternative port"
    };
  }
  
  return { status: "FAIR", message: "Normal sea state" };
}
```

### TODO: Next Steps for Arrival
1. Integrate StormGlass or World Tides API
2. Implement tide curve chart (Recharts)
3. Add current set & drift calculations
4. Create alternative port ranking
5. Add weather integration (wind forecasts)

---

## 💰 Budgeter Module Implementation

### Objective
Calculate passage costs, convert currencies, track provisioning freshness.

### Key Files
- `modules/budgeter/components/BudgetSummary.tsx` - Dashboard widget
- `app/budget/page.tsx` - Full budget page
- `lib/mockData.ts` - Exchange rates

### Forex Conversion (ExchangeRate-API) (TODO)

```typescript
// lib/forex/rates.ts (to implement)

async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
  );
  
  const data = await response.json();
  const rate = data.conversion_rates[toCurrency];
  
  return amount * rate;
}

// Cache rates to minimize API calls
const rateCache = new Map<string, { rate: number; timestamp: number }>();

async function getCachedRate(from: string, to: string): Promise<number> {
  const key = `${from}_${to}`;
  const cached = rateCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    return cached.rate;
  }
  
  const rate = await convertCurrency(1, from, to);
  rateCache.set(key, { rate, timestamp: Date.now() });
  return rate;
}
```

### Provisioning Freshness Tracker (TODO)

```typescript
// lib/provisioning/tracker.ts (to implement)

interface ProvisionItem {
  name: string;
  purchaseDate: Date;
  expectedShelfLife: number; // days
  storageMethod: "fridge" | "freezer" | "dry";
}

function calculateFreshness(item: ProvisionItem): {
  daysRemaining: number;
  freshnessPct: number;
  priority: "high" | "medium" | "low";
  recommendation: string;
} {
  const now = new Date();
  const purchaseMs = item.purchaseDate.getTime();
  const expiryMs = purchaseMs + item.expectedShelfLife * 24 * 60 * 60 * 1000;
  const remainingMs = expiryMs - now.getTime();
  const daysRemaining = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const freshnessPct = (daysRemaining / item.expectedShelfLife) * 100;
  
  let priority = "low";
  let recommendation = "Store normally";
  
  if (daysRemaining <= 1) {
    priority = "high";
    recommendation = "Use today!";
  } else if (daysRemaining <= 3) {
    priority = "medium";
    recommendation = "Prioritize in meal planning";
  }
  
  return { daysRemaining, freshnessPct, priority, recommendation };
}
```

### Expense Logging & Budgeting (TODO)

```typescript
// lib/budget/ledger.ts (to implement)

async function recordExpense(
  amount: number,
  currency: string,
  description: string,
  legId: string
) {
  const homeCurrency = userProfile.homeCurrency; // e.g., "AUD"
  const rate = await getCachedRate(currency, homeCurrency);
  const amountInHome = amount * rate;
  
  await recordExpense({
    amount,
    currency,
    amountInHome,
    description,
    timestamp: new Date(),
    legId
  });
}

function getBudgetSummary(legId: string) {
  const leg = getBudgetLeg(legId);
  const expenses = getExpenses(legId);
  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amountInHome, 0);
  const remaining = leg.totalBudget - totalSpent;
  const spendRate = (totalSpent / leg.totalBudget) * 100;
  
  return { totalSpent, remaining, spendRate };
}
```

### TODO: Next Steps for Budgeter
1. Integrate ExchangeRate-API
2. Implement expense logger
3. Add provisioning freshness calculator
4. Create budget vs. actual charts
5. Add meal planning recommendations

---

## 🌐 Deep Sea Mode Implementation

### Objective
Switch to text-only interface when connection speed is low (Starlink, 2G).

### Key Files
- `lib/pwa/usePWA.ts` - PWA hooks including `useDeepSeaMode()`
- `public/sw.js` - Service Worker for caching

### Deep Sea Mode CSS

```css
/* styles/deepsea-mode.css */

body.deep-sea-mode {
  /* Remove all images */
  img { display: none; }
  
  /* Replace charts with text descriptions */
  .chart {
    background: linear-gradient(to right, #dbeafe, #bfdbfe);
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: monospace;
    white-space: pre-wrap;
  }
  
  /* Replace maps with GeoJSON text vectors */
  .map {
    max-width: 100%;
    font-size: 0.75rem;
    line-height: 1;
    background: #fef3c7;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  
  /* Simplify UI: larger fonts, more spacing */
  button { padding: 1rem; font-size: 1.25rem; }
  
  /* Use emoji for status (no images) */
  .status-gauge::before { content: "🟢 "; }
}
```

### Conditional Rendering

```typescript
// lib/pwa/usePWA.ts

export function useDeepSeaMode() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      
      const updateMode = () => {
        const effectiveType = connection.effectiveType;
        const isSlowOrSaver = 
          effectiveType === "2g" || 
          effectiveType === "slow-2g" || 
          connection.saveData;
        
        setIsSlowConnection(isSlowOrSaver);
        
        // Apply CSS class conditionally
        if (isSlowOrSaver) {
          document.body.classList.add("deep-sea-mode");
        } else {
          document.body.classList.remove("deep-sea-mode");
        }
      };

      updateMode();
      connection.addEventListener("change", updateMode);
      return () => connection.removeEventListener("change", updateMode);
    }
  }, []);

  return { isSlowConnection };
}
```

### Service Worker Caching Strategy

```javascript
// public/sw.js

const CACHE_NAME = "bluehorizon-v1";

self.addEventListener("fetch", (event) => {
  // Cache-first for static assets
  if (event.request.url.includes(".css") || 
      event.request.url.includes(".js") ||
      event.request.url.includes(".woff")) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(r => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, r.clone()));
          return r;
        });
      })
    );
  }
  
  // Network-first for API calls
  else if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then(r => {
          caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### TODO: Next Steps for Deep Sea Mode
1. Create comprehensive deepsea-mode.css
2. Implement GeoJSON text vector rendering
3. Add connection monitoring to all components
4. Create text-only tide representation
5. Test on satellite connection

---

## 🗄️ Supabase Integration (CRITICAL NEXT STEP)

### Setup Steps

1. **Create Supabase project**: https://supabase.com
2. **Run migrations** (create tables as in README.md)
3. **Enable RLS (Row-Level Security)**:
   ```sql
   ALTER TABLE vault ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can only access their own vaults"
     ON vault FOR ALL
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   ```

4. **Create `lib/supabase/client.ts`**:
   ```typescript
   import { createClient } from "@supabase/supabase-js";
   
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

5. **Update AuthContext.tsx** to use real Supabase auth

---

## 📝 Contributing Guidelines

1. **Follow the module structure**: Each feature lives in `modules/{name}/`
2. **Use TypeScript**: All new files should be `.ts` or `.tsx`
3. **Test offline**: Use DevTools → Network → Offline
4. **Document with comments**: Explain "why", not "what"
5. **Keep components pure**: Use hooks for side effects

---

## 🧪 Testing Strategy (TODO)

- **Unit tests**: vitest for utilities (encryption, forex)
- **E2E tests**: Playwright for full workflows
- **Offline tests**: Test Service Worker + IndexedDB
- **Performance**: Lighthouse PWA audit

---

**Ready to build? Start with: `npm install && npm run dev`** ⛵
