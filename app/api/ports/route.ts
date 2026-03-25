/**
 * API Route: Search and query ports from NGA World Port Index
 * GET /api/ports?q=search_term - Search ports by name/country
 * GET /api/ports?lat=17.1&lng=-61.8&radius=50 - Find nearby ports
 * GET /api/ports?limit=50&offset=0 - Get all ports with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    return null; // Supabase not configured, will use mock data
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50';

    if (query) {
      // Search by name/country
      const supabase = getSupabaseClient();

      if (supabase) {
        const { data: ports, error } = await supabase
          .from('ports')
          .select('*')
          .or(`portName.ilike.%${query}%,country.ilike.%${query}%`)
          .limit(10);

        if (error) {
          console.error('Database error:', error);
          return NextResponse.json(
            { error: 'Failed to search ports' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ports: ports || [] });
      } else {
        // Return mock data when Supabase not configured
        const mockPorts = [
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
          }
        ].filter(port =>
          port.portName.toLowerCase().includes(query.toLowerCase()) ||
          port.country.toLowerCase().includes(query.toLowerCase())
        );

        return NextResponse.json({ ports: mockPorts });
      }
    }

    if (lat && lng) {
      // Find nearby ports using bounding box approximation
      const supabase = getSupabaseClient();

      if (supabase) {
        const radiusKm = parseInt(radius);
        const latDelta = radiusKm / 111; // ~111km per degree latitude
        const lngDelta = radiusKm / (111 * Math.cos(parseFloat(lat) * Math.PI / 180));

        const { data: ports, error } = await supabase
          .from('ports')
          .select('*')
          .gte('latitude', parseFloat(lat) - latDelta)
          .lte('latitude', parseFloat(lat) + latDelta)
          .gte('longitude', parseFloat(lng) - lngDelta)
          .lte('longitude', parseFloat(lng) + lngDelta)
          .limit(20);

        if (error) {
          console.error('Database error:', error);
          return NextResponse.json(
            { error: 'Failed to find nearby ports' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ports: ports || [] });
      } else {
        // Return mock nearby ports when Supabase not configured
        const mockPorts = [
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
          }
        ];

        return NextResponse.json({ ports: mockPorts });
      }
    }

    // Return all ports (paginated)
    const supabase = getSupabaseClient();

    if (supabase) {
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const { data: ports, error, count } = await supabase
        .from('ports')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch ports' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ports: ports || [],
        total: count || 0,
        limit,
        offset
      });
    } else {
      // Return mock data when Supabase not configured
      const mockPorts = [
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

      return NextResponse.json({
        ports: mockPorts,
        total: mockPorts.length,
        limit: 50,
        offset: 0
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}