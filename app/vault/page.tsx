"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function VaultPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-ocean to-horizon text-white p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-2">🔐 Secure Vault</h1>
          <p className="text-blue-100">
            All documents encrypted with AES-256. You hold the key.
          </p>
        </div>

        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-6 text-ocean">Document Management</h2>
          
          {/* Upload Section */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center mb-6">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-lg font-semibold text-ocean mb-2">Drop documents here</p>
            <p className="text-sm text-gray-600 mb-4">
              PDFs, images, and certificates will be encrypted before storage
            </p>
            <button className="bg-ocean text-white px-6 py-2 rounded hover:bg-ocean-dark">
              Browse Files
            </button>
          </div>

          {/* Vault Contents */}
          <div className="space-y-3">
            <h3 className="font-semibold text-ocean mb-4">Your Documents</h3>
            <div className="space-y-2">
              {[
                { name: "passport.pdf", expires: "12/31/2026", valid: true },
                { name: "boat_registration.pdf", expires: "06/30/2025", valid: true },
                { name: "insurance.pdf", expires: "03/12/2025", valid: false },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📋</span>
                    <div>
                      <p className="font-semibold text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">Expires: {doc.expires}</p>
                    </div>
                  </div>
                  <span className={doc.valid ? "status-green" : "status-red"}>
                    {doc.valid ? "✓ Valid" : "⚠ Expiring"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="mentor-card">
          <h2 className="text-2xl font-bold mb-4 text-ocean">Destination Gap Analysis</h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Select Destination</span>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>Choose a country...</option>
                <option>Australia (AU)</option>
                <option>New Zealand (NZ)</option>
                <option>Fiji (FJ)</option>
              </select>
            </label>
            <button className="w-full bg-ocean text-white py-2 rounded hover:bg-ocean-dark">
              Analyze Requirements
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
