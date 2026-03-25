"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function HeartbeatPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-ocean to-horizon text-white p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-2">⚙️ Vessel Heartbeat</h1>
          <p className="text-blue-100">
            Real-time vessel intelligence from Signal K Gateway integration
          </p>
        </div>

        {/* Connection Status */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Gateway Connection</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="font-semibold text-yellow-800 mb-1">⚠️ Not Connected</p>
              <p className="text-sm text-yellow-700">
                Connect to your boat's Signal K gateway via Wi-Fi to enable automated monitoring
              </p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Signal K Gateway URL
                </span>
                <input
                  type="text"
                  placeholder="ws://192.168.1.100:3000"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </label>
              <button className="w-full bg-ocean text-white py-2 rounded hover:bg-ocean-dark">
                Connect to Gateway
              </button>
            </div>
          </div>
        </div>

        {/* Engine Status */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Propulsion System</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Engine Runtime</p>
                <p className="text-3xl font-bold text-ocean">450h</p>
              </div>
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Engine Temperature</p>
                <p className="text-3xl font-bold text-green-700">75°C</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-ocean mb-3">Service Schedule</h3>
              <div className="space-y-2">
                {[
                  { item: "Oil Change", nextDue: "50h", status: "warning" },
                  { item: "Fuel Filter", nextDue: "200h", status: "ok" },
                  { item: "Prop Shaft Inspection", nextDue: "800h", status: "ok" },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{service.item}</span>
                    <span className={service.status === "warning" ? "text-yellow-600 font-semibold" : "text-green-600"}>
                      {service.nextDue} remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spare Parts Inventory */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Spare Parts Inventory</h2>
          
          <div className="space-y-2">
            {[
              { name: "Oil Filters", stock: 2, needed: "100h" },
              { name: "Fuel Filters", stock: 1, needed: "Never" },
              { name: "Impeller", stock: 0, needed: "600h", alert: true },
            ].map((part, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded ${
                  part.alert ? "bg-red-50 border-l-4 border-red-400" : "bg-gray-50"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm">{part.name}</p>
                  <p className="text-xs text-gray-500">Needed in {part.needed}</p>
                </div>
                <span className={part.stock === 0 ? "status-red" : "text-green-600 font-semibold"}>
                  Stock: {part.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
