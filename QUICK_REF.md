# BlueHorizon Quick Reference Guide

Fast answers to common questions while developing.

---

## ⚡ Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server locally
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Install new package
npm install <package>

# View project structure
tree -L 2 -I 'node_modules|.next|.git'

# Check Service Worker in DevTools
# 1. Open DevTools (F12)
# 2. Application tab → Service Workers
# 3. See current registration status
```

---

## 🔧 Common Tasks

### How do I add a new page?

1. Create file under `app/`
```
app/my-feature/page.tsx
```

2. Add to navigation header:
```typescript
// components/layout/Header.tsx
<Link href="/my-feature">My Feature</Link>
```

3. Use DashboardLayout:
```typescript
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MyFeaturePage() {
  return (
    <DashboardLayout>
      {/* Your content */}
    </DashboardLayout>
  );
}
```

---

### How do I encrypt data?

```typescript
import { encryptData, deriveKeyFromPassword, generateSalt, saltToBase64 } from "@/lib/crypto/encryption";

// Generate password-based key
const password = user.masterPassphrase;
const salt = generateSalt();
const key = await deriveKeyFromPassword(password, salt);

// Encrypt document
const encrypted = await encryptData(documentContent, key);

// Store both salt and encrypted data
const vaultRecord = {
  salt: saltToBase64(salt), // Store this for later decryption
  ciphertext: encrypted.ciphertext,
  iv: encrypted.iv,
  expiry: docExpiry
};
```

---

### How do I store data offline?

```typescript
import { 
  saveEncryptedDocument, 
  getEncryptedDocument,
  getAllVaultDocs 
} from "@/lib/idb/store";

// Save to IndexedDB
await saveEncryptedDocument("doc_123", {
  userId: "user_456",
  type: "passport",
  encrypted: encryptedBlob,
  expiryDate: "2026-12-31"
});

// Retrieve when offline
const doc = await getEncryptedDocument("doc_123");

// Get all docs for syncing
const unsyncedDocs = await getAllVaultDocs();
```

---

### How do I test offline mode?

1. **DevTools Method:**
   - Open DevTools (F12)
   - Network tab
   - Click "Offline" checkbox
   - Page should still work with cached data

2. **Service Worker Check:**
   - DevTools → Application → Service Workers
   - Data should display from IndexedDB

3. **Clear Cache & Try:**
   ```javascript
   // In console:
   if ('caches' in window) {
     caches.keys().then(names => {
       names.forEach(name => caches.delete(name));
     });
   }
   ```

---

### How do I test PWA installation?

1. **Chrome/Edge:**
   - Run `npm run dev`
   - Visit http://localhost:3000
   - DevTools → Application → Install prompts appear in console
   - Click "Install" button in address bar

2. **Android Phone:**
   - Open Chrome on device
   - Visit your domain
   - Menu → "Install app"

3. **iPhone:**
   - Safari → Tap Share
   - "Add to Home Screen"
   - Opens as standalone app

---

### How do I use the color scheme?

```typescript
// Tailwind's ocean theme (in tailwind.config.js)
const colors = {
  'ocean-dark': '#0f172a',    // Very dark blue
  'ocean': '#1e40af',         // Main blue
  'ocean-light': '#3b82f6',   // Light blue
  'deck': '#f5f3ff',          // Light background
  'horizon': '#06b6d4',       // Cyan accent
};

// In components:
<div className="bg-ocean text-white">
  <button className="bg-ocean-light hover:bg-ocean">
    Primary action
  </button>
</div>

<div className="bg-horizon text-white">
  Accent element
</div>

<div className="mentor-card">
  {/* Predefined mentor UI style */}
</div>
```

---

### How do I add a modal/dialog?

```typescript
"use client";

import { useState } from "react";

export function MyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-ocean text-white px-4 py-2 rounded"
      >
        Open
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm</h2>
            <p className="text-gray-600 mb-6">Are you sure?</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Action here
                  setIsOpen(false);
                }}
                className="px-4 py-2 bg-ocean text-white rounded hover:bg-ocean-dark"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 🐛 Troubleshooting

### "Cannot find module '@/lib/...'"

**Problem:** Import path not working

**Solution:** Check `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

---

### "Service Worker not registering"

**Problem:** Service Worker not appearing in DevTools

**Solution:** 
1. Check `public/sw.js` exists
2. Clear browser cache: DevTools → Application → Clear site data
3. Restart dev server: `npm run dev`
4. Check console for errors

---

### "IndexedDB not persisting"

**Problem:** Data lost after page refresh

**Solution:**
1. Verify database is created:
   ```javascript
   // In console
   indexedDB.databases().then(dbs => console.log(dbs));
   ```

2. Check for errors in code:
   ```typescript
   try {
     await saveEncryptedDocument(...);
   } catch (error) {
     console.error("IDB save failed:", error);
   }
   ```

3. Increase quota if needed:
   ```javascript
   navigator.storage.estimate().then(estimate => {
     console.log(`Used: ${estimate.usage}, Available: ${estimate.quota}`);
   });
   ```

---

### "CORS error when calling external API"

**Problem:** `Access to XMLHttpRequest... blocked by CORS policy`

**Solution:** Use server-side proxy route:
```typescript
// ❌ Don't do this in client-side code
const data = await fetch("https://api.external.com/...");

// ✅ Do this instead: create app/api/proxy/route.ts
export async function GET(request: Request) {
  const response = await fetch("https://api.external.com/...", {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`
    }
  });
  return Response.json(await response.json());
}

// Then call from client:
const data = await fetch("/api/proxy");
```

---

### "How do I search for ports?"

**Port Database:** BlueHorizon includes 1000+ ports from NGA World Port Index.

```typescript
// Search by name/country
const response = await fetch('/api/ports/search?q=antigua');
const { ports } = await response.json();

// Returns:
{
  "query": "antigua",
  "ports": [
    {
      "port_name": "St. John's",
      "country": "Antigua and Barbuda",
      "latitude": 17.1167,
      "longitude": -61.85,
      "harbor_size": "Small",
      "max_draft": 10.5,
      "facilities": ["Container Terminal", "Fuel Station"]
    }
  ],
  "count": 1
}
```

**Nearby Ports:**
```typescript
const response = await fetch('/api/ports/nearby?lat=17.1&lng=-61.8&radius=50');
const { ports } = await response.json();
```

**In Components:**
```typescript
// ArrivalAssistant.tsx - Port search with autocomplete
const [portSearch, setPortSearch] = useState("");
const [searchResults, setSearchResults] = useState([]);

useEffect(() => {
  if (portSearch.length < 2) return;
  fetch(`/api/ports/search?q=${portSearch}`)
    .then(r => r.json())
    .then(data => setSearchResults(data.ports));
}, [portSearch]);
```

---

### "Build fails with TypeScript errors"

**Solution:** 
1. Check error messages:
   ```bash
   npm run build  # Full output
   ```

2. Type check locally:
   ```bash
   npx tsc --noEmit
   ```

3. Fix common issues:
   - Import missing types: `import type { MyType } from "@/types"`
   - Add return type: `function getFoo(): string { ... }`
   - Check null safety: `item?.property || defaultValue`

---

### "Slow performance / High CPU usage"

**Solution:**
1. Check for unnecessary re-renders:
   ```bash
   npm install react-devtools-profiler
   # Use Profiler tab in DevTools → React
   ```

2. Minimize dependencies:
   ```bash
   npm ls  # Check installed packages
   ```

3. Optimize images:
   ```typescript
   // Use Next.js Image component (not <img>)
   import Image from "next/image";
   
   <Image 
     src="/banner.jpg" 
     alt="Hero" 
     width={800} 
     height={400}
     priority  // Load immediately
   />
   ```

---

### "Encryption/Decryption errors"

**Solution:**
1. Verify salt is stored correctly:
   ```typescript
   // When encrypting:
   const salt = generateSalt();
   const saltB64 = saltToBase64(salt);
   
   // When decrypting:
   const saltRecovered = base64ToSalt(saltB64);
   const key = await deriveKeyFromPassword(password, saltRecovered);
   ```

2. Check IV format:
   ```typescript
   // Both must be base64 encoded
   encrypted.iv  // Should be base64
   encrypted.ciphertext  // Should be base64
   ```

---

## 📚 File Structure Cheat Sheet

```
/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (/)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── [module]/page.tsx  # Module pages
│
├── components/            # Reusable React components
│   └── layout/           # Layout components (Header, etc.)
│
├── modules/              # Feature modules (5 features)
│   ├── vault/
│   ├── heartbeat/
│   ├── arrival/
│   ├── budgeter/
│   └── */components/     # Module-specific components
│
├── lib/                  # Utilities & helpers
│   ├── crypto/          # Encryption functions
│   ├── idb/             # IndexedDB operations
│   ├── pwa/             # PWA hooks
│   ├── auth/            # Auth context
│   ├── hooks/           # React hooks
│   ├── mockData.ts      # Demo data
│   └── supabase/        # (Coming) Supabase client
│
├── types/               # TypeScript interfaces
│   └── index.ts
│
├── public/              # Static assets
│   ├── manifest.json    # PWA manifest
│   ├── sw.js           # Service Worker
│   ├── favicon.ico
│   └── icons/
│
├── .env.local          # Secrets (Git ignored)
├── tsconfig.json       # TypeScript config
├── tailwind.config.js  # Tailwind theme
├── next.config.js      # Next.js config
└── package.json        # Dependencies
```

---

## 🎓 Learning Resources

- **Next.js App Router**: https://nextjs.org/docs/app
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Service Worker**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **PWA**: https://web.dev/progressive-web-apps/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs

---

## 🆘 Getting Help

1. **Check the docs:**
   - README.md (overview)
   - DEVELOPMENT.md (implementation guides)
   - API.md (external integrations)
   - DEPLOYMENT.md (production setup)

2. **Search codebase:**
   ```bash
   grep -r "searchTerm" lib/ modules/
   ```

3. **Check TypeScript types:**
   ```bash
   code types/index.ts  # See all interfaces
   ```

4. **Debug in browser:**
   - F12 → Console → Type commands
   - DevTools → Sources → Set breakpoints

---

**Last Updated:** March 2026

**Need more help?** Create an issue or check existing documentation!

⛵ **Happy developing!**
