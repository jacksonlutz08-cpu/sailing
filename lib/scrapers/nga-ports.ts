/**
 * NGA World Port Index Scraper
 * Scrapes port data from NGA World Port Index for BlueHorizon sailing PWA
 */

import { load } from 'cheerio';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

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
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Scrape port data from NGA World Port Index
   * Note: This is a placeholder implementation. The actual NGA WPI data
   * may require special access or be available as downloadable datasets.
   */
  async scrapePorts(): Promise<PortData[]> {
    const ports: PortData[] = [];

    try {
      // Placeholder: NGA World Port Index URL
      // In reality, this might be a protected resource requiring authentication
      const response = await fetch('https://msi.nga.mil/NGAPortal/MSI.portal?_nfpb=true&_pageLabel=msi_portal_page_62&pubCode=0015', {
        headers: {
          'User-Agent': 'BlueHorizon-Sailing-PWA/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch NGA data: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);

      // Parse port data from HTML
      // This is a simplified example - actual parsing would depend on the HTML structure
      $('.port-entry').each((index, element) => {
        const portData = this.parsePortEntry($, element);
        if (portData) {
          ports.push(portData);
        }
      });

    } catch (error) {
      console.error('Error scraping NGA ports:', error);
      // Fallback to sample data for development
      return this.getSamplePorts();
    }

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
        facilities: $(element).find('.facilities li').map((i, el) => $(el).text().trim()).get(),
        commodities: $(element).find('.commodities li').map((i, el) => $(el).text().trim()).get(),
        charts: $(element).find('.charts li').map((i, el) => $(el).text().trim()).get(),
        publications: $(element).find('.publications li').map((i, el) => $(el).text().trim()).get(),
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
      // First, ensure the table exists
      await this.ensureTableExists();

      // Insert or update ports
      const { error } = await this.supabase
        .from('ports')
        .upsert(ports, {
          onConflict: 'portId',
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