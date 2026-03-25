"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import VaultStatus from "@/modules/vault/components/VaultStatus";
import VesselStatus from "@/modules/heartbeat/components/VesselStatus";
import ArrivalAssistant from "@/modules/arrival/components/ArrivalAssistant";
import BudgetSummary from "@/modules/budgeter/components/BudgetSummary";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean to-horizon text-white p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-2">Welcome Back, Captain</h1>
          <p className="text-blue-100">Your vessel and documents are secure. Ready to set sail?</p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Secure Vault */}
          <div className="mentor-card">
            <h2 className="text-2xl font-bold mb-4 text-ocean">🔐 Secure Vault</h2>
            <VaultStatus />
          </div>

          {/* Vessel Heartbeat */}
          <div className="mentor-card">
            <h2 className="text-2xl font-bold mb-4 text-ocean">⚙️ Vessel Heartbeat</h2>
            <VesselStatus />
          </div>

          {/* Arrival Assistant */}
          <div className="mentor-card">
            <h2 className="text-2xl font-bold mb-4 text-ocean">🌊 Arrival Assistant</h2>
            <ArrivalAssistant />
          </div>

          {/* Budget & Provisioning */}
          <div className="mentor-card">
            <h2 className="text-2xl font-bold mb-4 text-ocean">💰 Budgeter</h2>
            <BudgetSummary />
          </div>
        </div>

        {/* PWA Status */}
        <div className="mentor-card bg-blue-50 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ocean">Deep Sea Mode</h3>
              <p className="text-sm text-gray-600">You're connected. Data syncing in background.</p>
            </div>
            <span className="status-green">✓ Online</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
