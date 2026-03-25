# NGA World Port Index Data Sources

## Official NGA WPI Access Methods

### 1. 🌐 Web Portal Access
**URL:** https://msi.nga.mil/NGAPortal/MSI.portal
- **Access:** Public web interface
- **Data:** Interactive port search and details
- **Format:** HTML web pages
- **Usage:** Web scraping with proper permissions

### 2. 📊 Direct Dataset Downloads
**URL:** https://www.nga.mil/ProductsServices/MaritimeSafetyInformation/Pages/WorldPortIndex.aspx
- **Access:** Free download (may require registration)
- **Formats:** Excel, CSV, Shapefile, or database dumps
- **Usage:** Download and import directly

### 3. 🛰️ API Access (if available)
- **Status:** Limited public API access
- **Alternative:** Use NOAA's tide APIs (already integrated)
- **Contact:** NGA for special access permissions

## Implementation Steps

### Step 1: Choose Access Method

**Option A: Web Scraping**
```typescript
// Use the existing scraper
const scraper = new NGAPortScraper();
const ports = await scraper.scrapePorts();
```

**Option B: Direct Dataset Import**
```bash
# Download official dataset
wget https://msi.nga.mil/Downloads/WPI.zip
unzip WPI.zip

# Convert to JSON/CSV for import
# Then use database import tools
```

### Step 2: Data Format Mapping

The scraper expects this structure:
```typescript
interface PortData {
  portId: string;        // Unique identifier
  portName: string;      // Port name
  country: string;       // Country name
  latitude: number;      // Decimal degrees
  longitude: number;     // Decimal degrees
  harborType: string;    // Type of harbor
  harborSize: string;    // Size category
  shelter: string;       // Shelter quality
  maxVesselSize: string; // Maximum vessel size
  maxDraft: number;      // Maximum draft in meters
  facilities: string[];  // Available facilities
  commodities: string[]; // Handled commodities
  charts: string[];      // Chart numbers
  publications: string[];// Publication references
}
```

### Step 3: Database Connection

**Supabase Setup:**
1. Create Supabase project
2. Run `database/schema.sql` in SQL Editor
3. Update environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Step 4: Data Import

**Automated Import:**
```bash
# Run the scraper
npm run scrape-ports
```

**Manual Import:**
```sql
-- In Supabase SQL Editor
COPY ports FROM '/path/to/nga-data.csv' WITH CSV HEADER;
```

## Alternative Data Sources

If NGA access is restricted:

### 1. World Port Index Alternatives
- **IHO World Port Index:** Similar global coverage
- **Regional port authorities:** Local government data
- **Commercial databases:** Marine traffic data

### 2. Crowdsourced Data
- **OpenSeaMap:** Community-maintained nautical data
- **MarineTraffic:** AIS vessel tracking data

### 3. Hybrid Approach
- Use NGA for official data where available
- Supplement with alternative sources
- Validate data quality and currency

## Legal Considerations

- **✅ Permitted:** Personal, non-commercial use
- **⚠️ Check:** Terms of service for bulk downloads
- **📞 Contact:** NGA for commercial or high-volume access
- **🔄 Updates:** NGA data is updated periodically

## Testing Data Quality

```sql
-- Verify imported data
SELECT
  COUNT(*) as total_ports,
  COUNT(DISTINCT country) as countries,
  AVG(max_draft) as avg_max_draft
FROM ports;

-- Check for data completeness
SELECT
  port_name,
  country,
  latitude,
  longitude
FROM ports
WHERE latitude IS NULL OR longitude IS NULL;
```</content>
<parameter name="filePath">/workspaces/sailing/NGA_CONNECTION_GUIDE.md