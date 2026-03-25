/**
 * API Route: Sync logbook entries (low-bandwidth delta sync)
 * 
 * Receives GPS, wind, and depth readings from IndexedDB.
 * Stores compressed "breadcrumbs" in Supabase.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { entries } = await request.json();

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { message: "No entries to sync" },
        { status: 400 }
      );
    }

    // TODO: Connect to Supabase
    // Compress entries before storing to minimize bandwidth
    // const compressed = entries.map(entry => ({
    //   timestamp: entry.timestamp,
    //   lat: entry.gps.lat,
    //   lon: entry.gps.lon,
    //   wind_speed: entry.wind.speed,
    //   depth: entry.depth
    // }));

    console.log("[API] Syncing", entries.length, "logbook entries");

    return NextResponse.json({
      synced: entries.length,
      message: "Logbook synced successfully",
    });
  } catch (error) {
    console.error("[API] Logbook sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
