# BlueHorizon: Offshore Sailing Companion PWA

A high-utility, offline-first Progressive Web Application for offshore sailors. Simplifies complex logistics through a "Mentor-like" interface, combining secure document management, vessel intelligence, and compliance tools.

## 🎯 Project Vision

**"Build for Reliability."** The Vault must be fully functional offline so a sailor can present documents to a customs officer in a remote bay with zero cell service.

**"Progressive Disclosure."** Don't show technical data unless the user clicks 'Details'. Keep the primary interface clean, visual, and reassuring.

---

## 📋 Core Modules

### I. The Secure Vault (One-Click Clearance)
**Security & Compliance Engine**

- **Client-side encryption**: AES-256 using Web Crypto API
- **Gap Analysis**: Automatically map user documents against 200+ country requirements
- **Automated PDF Mapping**: Generate clearance packs with pre-filled government forms using PDF-lib
- **Status Gauge**: Visual indicators for document validity and expiry warnings

### II. The Vessel Heartbeat (NMEA 2000 Integration)
**Automated Vessel Intelligence**

- **Signal K Integration**: WebSocket listener for boat Wi-Fi gateway
- **Predictive Maintenance**: Track engine runtime, trigger spares alerts at thresholds
- **Automated Logbook**: GPS, wind, depth captured every 60 minutes
- **IndexedDB Sync**: Offline storage, sync when Starlink/Cell returns

### III. The Arrival Assistant (Tides & Currents)
**Safety Feature to Prevent Groundings**

- **Port Database**: Search 1000+ ports from NGA World Port Index (harbor specs, max draft, facilities)
- **Tide Forecast**: Fetch harmonic data from StormGlass or World Tides API
- **Safe Entry Window Calculation**: Prevent grounding with tide height calculations
- **Current Analysis**: Warn of "Wind-against-Tide" sea states

### IV. The Guided Budgeter & Forex Anchor
**Trip Planning & Provisioning**

- **Reactive Pricing**: Link passage distance to fuel cost calculator
- **Forex Engine**: Convert local currencies to home currency (live rates)
- **Provisioning Tracker**: Days-until-expiry for perishables
- **Expense Logger**: Track actual vs. budgeted costs

### V. Deep Sea Mode (Offline-First PWA)
**Satellite Protocol for Low-Bandwidth Conditions**

- **Service Worker**: Aggressive caching of clearance packs & tide tables
- **Delta-Sync**: Sync only tiny JSON "breadcrumbs" to save data
- **Text-Only CSS**: Strips imagery on slow connections
- **IndexedDB**: Local-first data storage with background sync

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Encryption**: Web Crypto API (AES-256-GCM)
- **PDF Generation**: PDF-lib
- **Backend**: Supabase (PostgreSQL + Auth)
- **Offline Storage**: IndexedDB (idb library)
- **PWA**: Service Worker, Web App Manifest
- **State Management**: Zustand

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── vault/, heartbeat/, arrival/, budget/  (module pages)
│   └── api/sync/                             (delta sync endpoints)
├── modules/
│   ├── vault/, heartbeat/, arrival/, budgeter/ (module components)
├── components/layout/                        (RootLayout, Header, Dashboard)
├── lib/
│   ├── crypto/encryption.ts                  (AES-256 utilities)
│   ├── idb/store.ts                         (IndexedDB operations)
│   ├── pwa/usePWA.ts                        (PWA hooks)
│   ├── auth/AuthContext.tsx                 (Supabase auth placeholder)
│   └── mockData.ts                          (Demo data)
├── types/index.ts                           (TypeScript interfaces)
└── public/manifest.json, sw.js              (PWA assets)
```

---

## 🔐 Security

- **Client-side encryption**: AES-256-GCM with user-held master key
- **Zero-knowledge**: Supabase only sees encrypted blobs
- **PBKDF2 key derivation**: 100,000 iterations
- **Offline capability**: All critical data cached locally

---

## ✅ Phase 1: Complete

- ✅ Next.js scaffolding
- ✅ All 5 module components (Vault, Heartbeat, Arrival, Budget, PWA)
- ✅ Encryption utilities (Web Crypto API)
- ✅ IndexedDB store
- ✅ Service Worker foundation
- ✅ Mock data layer
- ✅ Mentor-like UI design

---

## 📝 Phase 2: In Progress

- 🔄 Supabase integration (auth + database)
- 🔄 External APIs (StormGlass, ExchangeRate-API)
- 🔄 Signal K WebSocket integration
- 🔄 PDF generation & clearance packs
- 🔄 Deep sea mode (text-only CSS)

---

## 📖 Documentation

- **Architecture**: See inline code comments
- **Security model**: `lib/crypto/encryption.ts`
- **Offline storage**: `lib/idb/store.ts`
- **PWA setup**: `lib/pwa/usePWA.ts`

---

## 🌊 For Sailors

- **Vault**: Secure document management with offline access
- **Heartbeat**: Real-time vessel monitoring (coming soon: Signal K)
- **Arrival**: Safe harbor entry windows based on tides
- **Budget**: Trip cost estimation and forex conversion
- **Deep Sea Mode**: Works on Starlink at 0.5 Mbps

---

## 🛥️ Next Steps

1. Run the app: `npm run dev`
2. Explore dashboard: http://localhost:3000
3. Check modules: Vault → Heartbeat → Arrival → Budget
4. Test offline: DevTools → Network → Offline
5. Review code: Start at `app/page.tsx`

**⛵ Happy sailing!**
