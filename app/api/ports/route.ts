/**
 * API Route: Search ports from NGA World Port Index
 * GET /api/ports/search?q=antigua
 * GET /api/ports/nearby?lat=17.1&lng=-61.8&radius=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50';

    if (query) {
      // Search by name/country
      const { data: ports, error } = await supabase
        .from('ports')
        .select('*')
        .or(`port_name.ilike.%${query}%,country.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to search ports' },
          { status: 500 }
        );
      }

      return NextResponse.json({ ports: ports || [] });
    }

    if (lat && lng) {
      // Find nearby ports
      const { data: ports, error } = await supabase.rpc('get_nearby_ports', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_km: parseInt(radius)
      });

      if (error) {
        console.error('Database error:', error);
        // Fallback to simple query if RPC fails
        const latDelta = parseInt(radius) / 111;
        const lngDelta = parseInt(radius) / (111 * Math.cos(parseFloat(lat) * Math.PI / 180));

        const { data: fallbackPorts } = await supabase
          .from('ports')
          .select('*')
          .gte('latitude', parseFloat(lat) - latDelta)
          .lte('latitude', parseFloat(lat) + latDelta)
          .gte('longitude', parseFloat(lng) - lngDelta)
          .lte('longitude', parseFloat(lng) + lngDelta)
          .limit(20);

        return NextResponse.json({ ports: fallbackPorts || [] });
      }

      return NextResponse.json({ ports: ports || [] });
    }

    // Return all ports (paginated)
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

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}