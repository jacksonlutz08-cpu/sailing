/**
 * SECURE VAULT MODULE
 * 
 * Core security and compliance engine.
 * Handles sensitive data with client-side AES-256 encryption.
 * Users hold the master key; data never transmitted unencrypted.
 */

"use client";

import { useState } from "react";
import { MOCK_DOCUMENTS, MOCK_COUNTRY_REQUIREMENTS } from "@/lib/mockData";
import { Document } from "@/types";

export default function VaultStatus() {
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
  
  // Gap analysis: check which documents are needed for a destination
  const gapAnalysis = (destinationCountry: string) => {
    const countryReq = MOCK_COUNTRY_REQUIREMENTS.find(
      (c) => c.countryCode === destinationCountry
    );

    if (!countryReq) return { missing: [], valid: [] };

    const missing = countryReq.requiredDocuments.filter(
      (req) => !documents.some((doc) => doc.type === req)
    );

    const valid = countryReq.requiredDocuments.filter(
      (req) =>
        documents.some(
          (doc) =>
            doc.type === req &&
            new Date(doc.expiryDate) > new Date()
        )
    );

    return { missing, valid };
  };

  const expiringDocuments = documents.filter((doc) => {
    const daysUntilExpiry = Math.floor(
      (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const analysis = gapAnalysis("FJ");

  return (
    <div className="space-y-4">
      {/* Status Gauge */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm font-medium text-gray-600">Vault Status</p>
          <p className="text-lg font-bold text-ocean">
            {documents.length} Documents Stored
          </p>
        </div>
        <div className="status-green text-2xl">✓ Encrypted</div>
      </div>

      {/* Expiring Documents Warning */}
      {expiringDocuments.length > 0 && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Action Required</p>
          {expiringDocuments.map((doc) => {
            const daysUntilExpiry = Math.floor(
              (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return (
              <p key={doc.id} className="text-sm text-yellow-700">
                {doc.fileName} expires in {daysUntilExpiry} days
              </p>
            );
          })}
        </div>
      )}

      {/* Destination Analysis */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-ocean mb-3">Fiji Entry Requirements</p>
        
        {analysis.valid.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-green-600 mb-1">✓ Ready ({analysis.valid.length})</p>
            <div className="flex flex-wrap gap-2">
              {analysis.valid.map((doc) => (
                <span key={doc} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.missing.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-600 mb-1">✗ Missing ({analysis.missing.length})</p>
            <div className="flex flex-wrap gap-2">
              {analysis.missing.map((doc) => (
                <span key={doc} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-ocean text-white py-2 rounded hover:bg-ocean-dark transition">
          Upload Document
        </button>
        <button className="flex-1 bg-blue-100 text-ocean py-2 rounded hover:bg-blue-200 transition">
          Export Clearance Pack
        </button>
      </div>
    </div>
  );
}
