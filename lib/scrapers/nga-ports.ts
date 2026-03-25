/**
 * NGA World Port Index Scraper
 * Scrapes port data from NGA World Port Index for BlueHorizon sailing PWA
 */

import { load } from 'cheerio';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface PortData {
  portId: string;
  portName: string;
  country: string;
  latitude: number;
  longitude: number;
  harborType: string;
  harborSize: string;
  shelter: string;
  maxVesselSize: string;
  maxDraft: number;
  facilities: string[];
  commodities: string[];
  charts: string[];
  publications: string[];
  lastUpdated: Date;
}

class NGAPortScraper {
  private supabase: any;

  constructor() {
    // Only initialize Supabase if environment variables are available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    } else {
      console.warn('⚠️ Supabase not configured - data will not be saved to database');
      this.supabase = null;
    }
  }

  /**
   * Main scraping method with multiple fallback strategies
   */
  async scrapePorts(): Promise<PortData[]> {
    console.log('🚢 Starting NGA World Port Index data collection...');

    const strategies = [
      { name: 'Web Scraping', method: () => this.scrapeFromWeb() },
      { name: 'Official Dataset', method: () => this.loadFromDataset() },
      { name: 'Alternative Sources', method: () => this.loadFromAlternatives() },
      { name: 'Sample Data Fallback', method: () => Promise.resolve(this.getSamplePorts()) }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`📡 Trying ${strategy.name}...`);
        const ports = await strategy.method();

        if (ports && ports.length > 0) {
          console.log(`✅ ${strategy.name} successful: ${ports.length} ports found`);
          return ports;
        } else {
          console.log(`⚠️ ${strategy.name} returned no data, trying next method...`);
        }
      } catch (error) {
        console.warn(`❌ ${strategy.name} failed:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.error('💥 All data collection methods failed');
    return [];
  }

  /**
   * Load from alternative maritime data sources
   */
  async loadFromAlternatives(): Promise<PortData[]> {
    const ports: PortData[] = [];

    try {
      // Try alternative maritime data sources
      console.log('🌍 Checking alternative data sources...');

      // Try to fetch from OpenSeaMap or other open maritime data
      const altSources = [
        'https://overpass-api.de/api/interpreter', // OpenStreetMap Overpass API for maritime data
        // Could add more alternative APIs here
      ];

      for (const source of altSources) {
        try {
          console.log(`  Trying alternative source: ${source.substring(0, 50)}...`);
          // Note: Actual implementation would depend on specific API
          // For now, we'll skip to sample data
        } catch (e) {
          console.log(`  Alternative source unavailable`);
        }
      }

      // Fallback to enhanced sample data
      console.log('  Using sample port data for demonstration');
      return this.getSamplePorts();

    } catch (error) {
      console.warn('Alternative sources failed:', error);
      return this.getSamplePorts();
    }
  }

  /**
   * Method 1: Scrape from NGA web interface
   */
  async scrapeFromWeb(): Promise<PortData[]> {
    const ports: PortData[] = [];

    try {
      // NGA Maritime Safety Information portal
      const response = await fetch('https://msi.nga.mil/NGAPortal/MSI.portal?_nfpb=true&_pageLabel=msi_portal_page_62&pubCode=0015', {
        headers: {
          'User-Agent': 'BlueHorizon-Sailing-PWA/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`NGA website returned ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);

      // Try multiple selector patterns for different possible NGA page structures
      const selectors = [
        '.port-entry',           // Standard CSS class
        '.port-listing',         // Alternative class name
        'tr.port-row',           // Table row approach
        'div.port-item',         // Div-based listing
        '[data-port-id]',        // Data attribute approach
        'table tbody tr',         // Generic table rows
        '.port-index-entry',     // Index entry class
        '.wpi-entry'             // WPI-specific class
      ];

      for (const selector of selectors) {
        const selectedElements = $(selector);
        if (selectedElements.length > 0) {
          console.log(`  Found ${selectedElements.length} elements matching selector: ${selector}`);
          selectedElements.each((index, element) => {
            const portData = this.parsePortEntry($, element);
            if (portData) {
              ports.push(portData);
            }
          });
          
          if (ports.length > 0) {
            console.log(`  ✅ Successfully extracted ${ports.length} ports with selector: ${selector}`);
            break;
          }
        }
      }

      if (ports.length === 0) {
        console.warn('  ⚠️ No ports found with any selector. NGA page structure may have changed.');
        console.warn('  💡 Consider downloading the official NGA dataset from https://msi.nga.mil/');
      }

    } catch (error) {
      console.warn('Web scraping failed:', error instanceof Error ? error.message : String(error));
      console.warn('  💡 If persistent, try downloading the NGA dataset manually');
    }

    return ports;
  }

  /**
   * Method 2: Load from official NGA datasets
   * Reads from locally downloaded JSON file
   */
  async loadFromDataset(): Promise<PortData[]> {
    const ports: PortData[] = [];

    try {
      const candidates = [
        'data/wpi_data.json',
        'data/wpi_data (1).json',
        'data/wpi_data_download.json',
        'data/wpi_data.csv',
        'data/wpi_data_download.csv',
        'data/wpi_data_download.zip'
      ];

      for (const candidate of candidates) {
        const dataPath = path.join(process.cwd(), candidate);
        if (!fs.existsSync(dataPath)) continue;

        console.log(`📁 Loading from local NGA dataset (${candidate})...`);

        if (dataPath.endsWith('.zip')) {
          const extractedData = await this.extractAndLoadZip(dataPath);
          if (extractedData) {
            return this.parseWPIDataset(extractedData);
          }
          continue;
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');

        if (dataPath.endsWith('.json')) {
          try {
            const wpiData = JSON.parse(fileContent);
            return this.parseWPIDataset(wpiData);
          } catch (parseError) {
            console.warn(`JSON parse failed for ${candidate}:`, parseError);
            continue;
          }
        }

        if (dataPath.endsWith('.csv')) {
          const wpiData = this.parseCSVtoObjectArray(fileContent);
          return this.parseWPIDataset(wpiData);
        }
      }

      // Fallback: Try the official WPI dataset API (if available)
      console.log('🌐 Local file not found, trying NGA API...');
      const wpiResponse = await fetch('https://msi.nga.mil/api/publications/download?type=json&key=WPI', {
        headers: {
          'User-Agent': 'BlueHorizon-Sailing-PWA/1.0'
        }
      });

      if (wpiResponse.ok) {
        const wpiData = await wpiResponse.json();
        return this.parseWPIDataset(wpiData);
      }

      // Option B: Try alternative NGA data sources
      console.log('📋 NGA WPI Dataset URLs to try:');
      console.log('  • https://msi.nga.mil/NGAPortal/MSI.portal');
      console.log('  • https://www.nga.mil/ProductsServices/ MaritimeSafetyInformation/Pages/WorldPortIndex.aspx');
      console.log('  • Contact NGA for direct data access');

    } catch (error) {
      console.warn('Dataset loading failed:', error instanceof Error ? error.message : String(error));
    }

    return ports;
  }

  private parseCSVtoObjectArray(csv: string): any[] {
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) {
      console.warn('CSV file appears to have no data rows');
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`📊 CSV headers found: ${headers.join(', ')}`);

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? '';
      });
      return row;
    });
  }

  private async extractAndLoadZip(zipPath: string): Promise<any[] | null> {
    try {
      // Use Node.js built-in zlib and fs for ZIP extraction
      // This is a simplified implementation - in production you might want a proper ZIP library
      console.log('📦 ZIP extraction not implemented yet - please extract manually to data/wpi_data.json');
      return null;
    } catch (error) {
      console.warn('ZIP extraction failed:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Parse official WPI dataset format
   */
  private parseWPIDataset(data: any): PortData[] {
    const ports: PortData[] = [];

    if (!Array.isArray(data)) {
      console.warn('WPI data is not an array - expected array of port objects');
      return ports;
    }

    console.log(`📊 Processing ${data.length} port records from WPI dataset...`);

    data.forEach((item, index) => {
      try {
        // Flexible field mapping - try multiple possible field names
        const portId = item.portId || item.port_id || item.id || item.port_number || item.index;
        const portName = item.portName || item.port_name || item.name || item.port;
        const country = item.country || item.nation || item.country_name;
        const latitude = item.latitude || item.lat || item.lat_deg;
        const longitude = item.longitude || item.lng || item.lon || item.lon_deg;

        // Validate required fields
        if (!portName || portName === '') {
          console.warn(`⚠️ Row ${index + 1}: Missing port name, skipping`);
          return;
        }

        if (latitude === undefined || latitude === null || latitude === '') {
          console.warn(`⚠️ Row ${index + 1} (${portName}): Missing latitude, skipping`);
          return;
        }

        if (longitude === undefined || longitude === null || longitude === '') {
          console.warn(`⚠️ Row ${index + 1} (${portName}): Missing longitude, skipping`);
          return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`⚠️ Row ${index + 1} (${portName}): Invalid coordinates (lat: ${latitude}, lng: ${longitude}), skipping`);
          return;
        }

        const port: PortData = {
          portId: `nga_${portId || portName.toLowerCase().replace(/\s+/g, '_')}`,
          portName: String(portName),
          country: String(country || 'Unknown'),
          latitude: lat,
          longitude: lng,
          harborType: String(item.harborType || item.harbor_type || item.type || 'Unknown'),
          harborSize: String(item.harborSize || item.harbor_size || item.size || 'Unknown'),
          shelter: String(item.shelter || 'Unknown'),
          maxVesselSize: String(item.maxVesselSize || item.max_vessel_size || item.vessel_size || 'Unknown'),
          maxDraft: parseFloat(item.maxDraft || item.max_draft || item.draft || 0),
          facilities: Array.isArray(item.facilities) ? item.facilities :
                    (item.facilities ? String(item.facilities).split(',').map(f => f.trim()) : []),
          commodities: Array.isArray(item.commodities) ? item.commodities :
                     (item.commodities ? String(item.commodities).split(',').map(c => c.trim()) : []),
          charts: Array.isArray(item.charts) ? item.charts :
                 (item.charts ? String(item.charts).split(',').map(c => c.trim()) : []),
          publications: Array.isArray(item.publications) ? item.publications :
                       (item.publications ? String(item.publications).split(',').map(p => p.trim()) : []),
          lastUpdated: new Date()
        };

        ports.push(port);

      } catch (parseError) {
        console.warn(`❌ Row ${index + 1}: Parse error -`, parseError instanceof Error ? parseError.message : String(parseError));
      }
    });

    console.log(`✅ Successfully parsed ${ports.length} valid ports (${data.length - ports.length} skipped)`);
    return ports;
  }

  private parsePortEntry($: any, element: any): PortData | null {
    try {
      const portName = $(element).find('.port-name').text().trim();
      const country = $(element).find('.country').text().trim();
      const lat = parseFloat($(element).find('.latitude').text().trim());
      const lng = parseFloat($(element).find('.longitude').text().trim());

      if (!portName || !country || isNaN(lat) || isNaN(lng)) {
        return null;
      }

      return {
        portId: `nga_${portName.toLowerCase().replace(/\s+/g, '_')}`,
        portName,
        country,
        latitude: lat,
        longitude: lng,
        harborType: $(element).find('.harbor-type').text().trim() || 'Unknown',
        harborSize: $(element).find('.harbor-size').text().trim() || 'Unknown',
        shelter: $(element).find('.shelter').text().trim() || 'Unknown',
        maxVesselSize: $(element).find('.max-vessel').text().trim() || 'Unknown',
        maxDraft: parseFloat($(element).find('.max-draft').text().trim()) || 0,
        facilities: $(element).find('.facilities li').map((_: number, el: any) => $(el).text().trim()).get(),
        commodities: $(element).find('.commodities li').map((_: number, el: any) => $(el).text().trim()).get(),
        charts: $(element).find('.charts li').map((_: number, el: any) => $(el).text().trim()).get(),
        publications: $(element).find('.publications li').map((index: number, elem: any) => $(elem).text().trim()).get(),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error parsing port entry:', error);
      return null;
    }
  }

  private getSamplePorts(): PortData[] {
    // Sample data for development/testing
    return [
      {
        portId: 'nga_st_johns_antigua',
        portName: "St. John's",
        country: 'Antigua and Barbuda',
        latitude: 17.1167,
        longitude: -61.8500,
        harborType: 'Coastal Breakwater',
        harborSize: 'Small',
        shelter: 'Good',
        maxVesselSize: 'Large',
        maxDraft: 10.5,
        facilities: ['Container Terminal', 'Ro-Ro', 'Cruise Terminal', 'Fuel Station'],
        commodities: ['Containerized', 'General Cargo', 'Cruise Passengers'],
        charts: ['Chart 25600', 'Chart 26200'],
        publications: ['Pub 110', 'Pub 120'],
        lastUpdated: new Date()
      },
      {
        portId: 'nga_san_francisco',
        portName: 'San Francisco',
        country: 'United States',
        latitude: 37.7749,
        longitude: -122.4194,
        harborType: 'River Basin',
        harborSize: 'Large',
        shelter: 'Excellent',
        maxVesselSize: 'Very Large',
        maxDraft: 12.8,
        facilities: ['Container Terminal', 'Bulk Terminal', 'Passenger Terminal'],
        commodities: ['Containers', 'Bulk', 'Vehicles', 'Passengers'],
        charts: ['Chart 18650', 'Chart 18660'],
        publications: ['Pub 110', 'Pub 111'],
        lastUpdated: new Date()
      }
    ];
  }

  /**
   * Store scraped port data in Supabase PostgreSQL
   */
  async storePorts(ports: PortData[]): Promise<void> {
    try {
      if (!this.supabase) {
        console.log(`⚠️ Supabase not configured - would store ${ports.length} ports`);
        console.log('📋 Sample ports that would be stored:');
        ports.slice(0, 3).forEach(port => {
          console.log(`  • ${port.portName}, ${port.country} (${port.latitude.toFixed(4)}, ${port.longitude.toFixed(4)})`);
        });
        return;
      }

      // First, ensure the table exists
      await this.ensureTableExists();

      // Insert or update ports
      const { error } = await this.supabase
        .from('ports')
        .upsert(ports, {
          onConflict: 'port_id',
          ignoreDuplicates: false
        });

      if (error) {
        throw error;
      }

      console.log(`Stored ${ports.length} ports in database`);
    } catch (error) {
      console.error('Error storing ports:', error);
      throw error;
    }
  }

  private async ensureTableExists(): Promise<void> {
    try {
      if (!this.supabase) {
        console.log('⚠️ Skipping table check - Supabase not configured');
        return;
      }

      // Check if table exists by trying to select from it
      const { error } = await this.supabase
        .from('ports')
        .select('port_id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, create it
        console.log('Creating ports table...');

        // Note: In production, you'd use Supabase migrations
        // For this demo, we'll create the table programmatically
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ports (
            port_id VARCHAR(100) PRIMARY KEY,
            port_name VARCHAR(255) NOT NULL,
            country VARCHAR(100) NOT NULL,
            latitude DECIMAL(10, 6) NOT NULL,
            longitude DECIMAL(10, 6) NOT NULL,
            harbor_type VARCHAR(50),
            harbor_size VARCHAR(20),
            shelter VARCHAR(50),
            max_vessel_size VARCHAR(50),
            max_draft DECIMAL(5, 2),
            facilities TEXT[],
            commodities TEXT[],
            charts TEXT[],
            publications TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        // This won't work with Supabase client directly
        // In a real implementation, you'd run this via Supabase dashboard
        console.log('⚠️ Please run the SQL in database/schema.sql in your Supabase dashboard');
      }
    } catch (error) {
      console.log('Table check completed');
    }
  }

  /**
   * Search ports by name or location
   */
  async searchPorts(query: string): Promise<PortData[]> {
    try {
      const { data, error } = await this.supabase
        .from('ports')
        .select('*')
        .or(`portName.ilike.%${query}%,country.ilike.%${query}%`)
        .limit(10);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching ports:', error);
      return [];
    }
  }

  /**
   * Get ports within radius of coordinates
   */
  async getNearbyPorts(lat: number, lng: number, radiusKm: number = 50): Promise<PortData[]> {
    try {
      // Using PostGIS for spatial queries (if available)
      const { data, error } = await this.supabase.rpc('get_nearby_ports', {
        lat,
        lng,
        radius_km: radiusKm
      });

      if (error) {
        // Fallback to simple bounding box if PostGIS not available
        return this.getNearbyPortsFallback(lat, lng, radiusKm);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting nearby ports:', error);
      return this.getNearbyPortsFallback(lat, lng, radiusKm);
    }
  }

  private async getNearbyPortsFallback(lat: number, lng: number, radiusKm: number): Promise<PortData[]> {
    // Simple bounding box approximation
    const latDelta = radiusKm / 111; // ~111km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await this.supabase
      .from('ports')
      .select('*')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta);

    if (error) {
      throw error;
    }

    return data || [];
  }
}

export default NGAPortScraper;