/**
 * API Route: Search ports by name
 * GET /api/ports/search?q=antigua
 */

import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query parameter required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    // For now, return mock data until database is set up
    const mockPorts = [
      {
        id: 'mock-1',
        port_name: "St. John's",
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-2',
        port_name: 'San Francisco',
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-3',
        port_name: 'Nassau',
        created_at: new Date().toISOString()
      }
    ];

    // Filter mock data based on query
    const filteredPorts = mockPorts.filter(port =>
      port.port_name.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      query,
      ports: filteredPorts,
      count: filteredPorts.length,
      note: 'Using mock data - run database setup for real NGA data'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}