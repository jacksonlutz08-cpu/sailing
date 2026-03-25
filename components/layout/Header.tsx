"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOfflineStatus } from "@/lib/hooks/useOfflineStatus";

export default function Header() {
  const { user, logout } = useAuth();
  const { isOnline } = useOfflineStatus();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl">⛵</div>
          <div>
            <h1 className="font-bold text-ocean text-xl">BlueHorizon</h1>
            <p className="text-xs text-gray-500">Offshore Companion</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {user && (
            <>
              <Link href="/vault" className="text-sm text-ocean hover:text-ocean-light">
                🔐 Vault
              </Link>
              <Link href="/heartbeat" className="text-sm text-ocean hover:text-ocean-light">
                ⚙️ Heartbeat
              </Link>
              <Link href="/arrival" className="text-sm text-ocean hover:text-ocean-light">
                🌊 Arrival
              </Link>
              <Link href="/budget" className="text-sm text-ocean hover:text-ocean-light">
                💰 Budget
              </Link>
              <div className="flex items-center gap-3">
                {!isOnline && <span className="offline-badge">Offline Mode</span>}
                <button
                  onClick={logout}
                  className="text-sm px-3 py-2 rounded bg-ocean-light text-white hover:bg-ocean"
                >
                  Logout
                </button>
              </div>
            </>
          )}
          {!user && (
            <Link href="/auth" className="text-sm px-3 py-2 rounded bg-ocean text-white hover:bg-ocean-light">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
