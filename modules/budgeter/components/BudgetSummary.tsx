/**
 * GUIDED BUDGETER & FOREX ANCHOR MODULE
 * 
 * Reactive pricing tied to passage distance.
 * Forex engine converts local currencies to user's home currency.
 * Provisioning freshness tracking.
 */

"use client";

import { useState } from "react";
import { MOCK_BUDGET_LEG, MOCK_EXCHANGE_RATES } from "@/lib/mockData";
import { BudgetLeg } from "@/types";

export default function BudgetSummary() {
  const [budgetLeg] = useState<BudgetLeg>(MOCK_BUDGET_LEG);
  const [homeCurrency] = useState("AUD");

  const totalBudget = budgetLeg.fuelEstimate + budgetLeg.visaFees + budgetLeg.foodBuffer;
  const remaining = totalBudget - budgetLeg.actualSpent;
  const spendRate = (budgetLeg.actualSpent / totalBudget) * 100;

  // Convert to home currency
  const exchangeRate = MOCK_EXCHANGE_RATES[budgetLeg.currency] / MOCK_EXCHANGE_RATES[homeCurrency];
  const totalInHomeCurrency = totalBudget * exchangeRate;
  const spentInHomeCurrency = budgetLeg.actualSpent * exchangeRate;

  return (
    <div className="space-y-4">
      {/* Passage Overview */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-gray-600">Current Leg</p>
        <p className="text-sm font-semibold text-ocean mt-1">
          {budgetLeg.startPort} → {budgetLeg.endPort}
        </p>
      </div>

      {/* Budget Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-600">Budget Usage</p>
          <p className="text-sm font-bold text-ocean">{spendRate.toFixed(0)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full"
            style={{ width: `${Math.min(spendRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fuel Estimate:</span>
          <span className="font-semibold">
            {budgetLeg.currency} {budgetLeg.fuelEstimate.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Visa & Fees:</span>
          <span className="font-semibold">
            {budgetLeg.currency} {budgetLeg.visaFees.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Food Buffer:</span>
          <span className="font-semibold">
            {budgetLeg.currency} {budgetLeg.foodBuffer.toLocaleString()}
          </span>
        </div>
        <div className="border-t border-gray-300 pt-2 flex justify-between text-sm font-bold">
          <span>Total Budget:</span>
          <span className="text-ocean">
            {budgetLeg.currency} {totalBudget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Forex Conversion */}
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs font-medium text-gray-600 mb-2">In {homeCurrency}</p>
        <p className="text-lg font-bold text-ocean">
          {homeCurrency} {totalInHomeCurrency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Spent: {homeCurrency} {spentInHomeCurrency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Provisioning Freshness (Placeholder) */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-xs font-medium text-gray-600">Fresh Provisions</p>
        <p className="text-sm font-semibold text-green-700 mt-1">2 days until expiry</p>
        <p className="text-xs text-gray-600 mt-1">Greens expire tomorrow evening</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-ocean text-white py-2 rounded hover:bg-ocean-dark transition text-sm">
          Log Expense
        </button>
        <button className="flex-1 bg-blue-100 text-ocean py-2 rounded hover:bg-blue-200 transition text-sm">
          View Forecast
        </button>
      </div>
    </div>
  );
}
