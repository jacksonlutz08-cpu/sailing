"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ArrivalPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-ocean to-horizon text-white p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-2">🌊 Arrival Assistant</h1>
          <p className="text-blue-100">
            Safe harbor entry windows based on real-time tide & current data
          </p>
        </div>

        {/* Port Selection */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Select Destination Port</h2>
          
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Port Name</span>
            <input
              type="text"
              placeholder="e.g., Suva, Fiji"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Boat Draft (feet)</span>
            <input
              type="number"
              placeholder="5.8"
              defaultValue="5.8"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </label>

          <button className="w-full bg-ocean text-white py-2 rounded hover:bg-ocean-dark mb-4">
            Calculate Safe Window
          </button>
        </div>

        {/* Tide Forecast */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Tidal Forecast - Suva, Fiji</h2>
          
          {/* Safe Entry Window */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300 mb-6">
            <p className="text-sm text-gray-600 mb-2">Safe Entry Window</p>
            <p className="text-3xl font-bold text-green-700 mb-2">07:45 AM - 10:30 AM</p>
            <p className="text-sm text-green-600">
              ✓ Adequate clearance for your {5.8} ft draft with 2 ft safety margin
            </p>
          </div>

          {/* Critical Parameters */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Predicted Tide Height</p>
              <p className="text-2xl font-bold text-ocean">2.5 meters</p>
            </div>
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Required Depth (w/ margin)</p>
              <p className="text-2xl font-bold text-ocean">2.1 meters</p>
            </div>
            <div className="p-4 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Clearance</p>
              <p className="text-2xl font-bold text-green-700">+0.4 meters</p>
            </div>
            <div className="p-4 bg-orange-50 rounded border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">Current Set & Drift</p>
              <p className="text-2xl font-bold text-orange-700">0.8 kt NE</p>
            </div>
          </div>

          {/* Tide Curve Visualization (Placeholder) */}
          <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg h-40 flex items-center justify-center mb-6 border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-ocean font-semibold mb-2">📈 24-Hour Tide Curve</p>
              <p className="text-xs text-gray-500">(Chart component coming)</p>
            </div>
          </div>

          {/* Warnings & Alerts */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ocean mb-3">Hazard Alerts</p>
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Wind Against Tide:</strong> 12 knots NE wind against 0.8 kt NE current = moderate lumpy sea state. Approach with caution.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Ports */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-4 text-ocean">Nearby Alternatives</h2>
          
          <div className="space-y-2">
            {[
              { port: "Levuka, Fiji", window: "10:15 AM - 12:45 PM", clearance: "+0.6m" },
              { port: "Savusavu, Fiji", window: "09:00 AM - 11:30 AM", clearance: "+0.3m" },
            ].map((alt, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ocean">{alt.port}</p>
                    <p className="text-xs text-gray-600">{alt.window}</p>
                  </div>
                  <span className="text-green-600 font-semibold">{alt.clearance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
