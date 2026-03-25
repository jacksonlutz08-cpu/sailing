"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function BudgetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-ocean to-horizon text-white p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-2">💰 Guided Budgeter</h1>
          <p className="text-blue-100">
            Fuel costs, forex conversion, and provisioning freshness tracking
          </p>
        </div>

        {/* Current Passage */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Current Passage</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Sydney, Australia → Fiji</p>
              <p className="text-2xl font-bold text-ocean">850 nm</p>
              <p className="text-xs text-gray-500 mt-2">Estimated 4 days at 8 knots</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">Home Currency</span>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  <option>AUD</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">Fuel Type</span>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  <option>Diesel</option>
                  <option>Gasoline</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Leg Budget</h2>
          
          <div className="space-y-4">
            {/* Budget inputs */}
            <div className="space-y-3">
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Fuel Estimate (AUD)
                  </span>
                  <input
                    type="number"
                    defaultValue="1200"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </label>
              </div>
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Visa & Port Fees (AUD)
                  </span>
                  <input
                    type="number"
                    defaultValue="50"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </label>
              </div>
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Food & Provisioning Buffer (AUD)
                  </span>
                  <input
                    type="number"
                    defaultValue="400"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-semibold">AUD 1,650</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-ocean border-t pt-2">
                <span>Total Budget:</span>
                <span>AUD 1,650</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Tracking */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Expense Tracking</h2>
          
          <div className="space-y-4 mb-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-sm font-bold text-ocean">51.5%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                  style={{ width: "51.5%" }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-gray-600">Remaining</p>
                <p className="text-lg font-bold text-ocean">AUD 800</p>
              </div>
              <div className="p-3 bg-orange-50 rounded border border-orange-200">
                <p className="text-xs text-gray-600">Spent</p>
                <p className="text-lg font-bold text-orange-700">AUD 850</p>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-ocean">AUD 1,650</p>
              </div>
            </div>
          </div>

          {/* Log Expense */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-ocean">Log Expense</h3>
            <input
              type="number"
              placeholder="Amount"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            <input
              type="text"
              placeholder="Description (e.g., Fuel at Sydney)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            <button className="w-full bg-ocean text-white py-2 rounded hover:bg-ocean-dark text-sm">
              Record Expense
            </button>
          </div>
        </div>

        {/* Forex Conversion */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Forex Anchor</h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Convert local port fees and fuel prices to your home currency (live rates)
          </p>

          <div className="space-y-3">
            {[
              { from: "AUD", to: "USD", rate: "0.65", amount: "1000" },
              { from: "FJD", to: "USD", rate: "0.47", amount: "100" },
              { from: "XPF", to: "EUR", rate: "0.0082", amount: "5000" },
            ].map((conversion, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold text-sm">{conversion.amount} {conversion.from}</p>
                  <p className="text-xs text-gray-500">@ {conversion.rate}</p>
                </div>
                <p className="font-bold text-ocean">
                  {(parseFloat(conversion.amount) * parseFloat(conversion.rate)).toFixed(2)} {conversion.to}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Provisioning Freshness */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">🥬 Provisioning Freshness</h2>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Track perishables to optimize meal planning and minimize waste
            </p>

            {[
              { item: "Fresh Greens", purchased: "2 days ago", expires: "Tomorrow", days: 1, priority: "high" },
              { item: "Carrots", purchased: "1 week ago", expires: "In 3 days", days: 3, priority: "medium" },
              { item: "Cabbage", purchased: "2 days ago", expires: "In 2 weeks", days: 14, priority: "low" },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded border-l-4 ${
                  item.priority === "high"
                    ? "bg-red-50 border-red-400"
                    : item.priority === "medium"
                    ? "bg-yellow-50 border-yellow-400"
                    : "bg-green-50 border-green-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{item.item}</p>
                  <span className={`text-xs font-bold ${
                    item.priority === "high"
                      ? "text-red-600"
                      : item.priority === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}>
                    {item.days}d left
                  </span>
                </div>
                <p className="text-xs text-gray-600">Expires: {item.expires}</p>
                {item.priority === "high" && (
                  <p className="text-xs text-red-700 mt-2 font-semibold">
                    💡 Plan salad tonight before switching to cabbage
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
