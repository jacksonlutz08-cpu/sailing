/**
 * VESSEL HEARTBEAT MODULE
 * 
 * Automated vessel intelligence from Signal K integration.
 * Monitors engine runtime, maintenance intervals, and stock levels.
 */

"use client";

import { useState } from "react";
import { MOCK_MAINTENANCE_RECORDS } from "@/lib/mockData";
import { MaintenanceRecord } from "@/types";

export default function VesselStatus() {
  const [records] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE_RECORDS);

  // Alert system: identify critical maintenance needs
  const criticalAlerts = records.filter((r) => r.nextServiceDue <= 100);
  const outOfStock = records.filter((r) => r.stockLevel === 0);

  return (
    <div className="space-y-4">
      {/* Engine Runtime Summary */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-gray-600">Main Engine Runtime</p>
        <p className="text-2xl font-bold text-green-700">450 Hours</p>
        <p className="text-xs text-gray-500 mt-1">Next service due: 50 hours</p>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-sm font-semibold text-red-800 mb-2">🚨 Critical Maintenance</p>
          {criticalAlerts.map((record) => (
            <div key={record.id} className="text-sm text-red-700 mb-2">
              <strong>{record.partName}</strong>: {record.nextServiceDue} hours remaining
            </div>
          ))}
        </div>
      )}

      {/* Stock Level Alert */}
      {outOfStock.length > 0 && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Out of Stock</p>
          {outOfStock.map((record) => (
            <p key={record.id} className="text-sm text-yellow-700">
              {record.partName} replacement needed
            </p>
          ))}
        </div>
      )}

      {/* Maintenance Schedule */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-ocean">Maintenance Schedule</p>
        <div className="space-y-1">
          {records.map((record) => (
            <div key={record.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
              <span className="font-medium">{record.partName}</span>
              <span className="text-gray-600">
                {record.nextServiceDue}h remaining
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full bg-ocean text-white py-2 rounded hover:bg-ocean-dark transition">
        Connect to Signal K Gateway
      </button>
    </div>
  );
}
