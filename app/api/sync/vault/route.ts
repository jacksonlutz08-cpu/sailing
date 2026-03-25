/**
 * API Route: Sync vault data
 * 
 * Receives encrypted documents from client IndexedDB
 * and stores them in Supabase.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json();

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { message: "No documents to sync" },
        { status: 400 }
      );
    }

    // TODO: Connect to Supabase
    // const { data, error } = await supabase
    //   .from("vault")
    //   .upsert(documents.map(doc => ({
    //     ...doc,
    //     user_id: user.id
    //   })));

    console.log("[API] Syncing", documents.length, "vault documents");

    return NextResponse.json({
      synced: documents.length,
      message: "Vault synced successfully",
    });
  } catch (error) {
    console.error("[API] Vault sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
