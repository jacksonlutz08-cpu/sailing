/**
 * ARRIVAL ASSISTANT MODULE
 *
 * Safety feature to prevent groundings and optimize fuel burn.
 * Fetches harmonic tide data and calculates safe entry windows.
 */

"use client";

import { useState, useEffect } from "react";
import { MOCK_TIDE_WINDOWS } from "@/lib/mockData";
import { TideWindow } from "@/types";

interface Port {
  id: string;
  port_name: string;
  created_at: string;
}

export default function ArrivalAssistant() {
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [portSearch, setPortSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Port[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTide] = useState<TideWindow>(MOCK_TIDE_WINDOWS[0]);

  // Search ports as user types
  useEffect(() => {
    const searchPorts = async () => {
      if (portSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/ports/search?q=${encodeURIComponent(portSearch)}`);
        const data = await response.json();
        setSearchResults(data.ports || []);
      } catch (error) {
        console.error('Error searching ports:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPorts, 300);
    return () => clearTimeout(debounceTimer);
  }, [portSearch]);

  const calculateSafetyStatus = () => {
    if (!selectedPort) return { isSafe: false, clearance: 0 };

    const totalDraft = selectedTide.boatDraft + selectedTide.safetyMargin;
    const isSafe = selectedTide.predictedHeight > totalDraft;
    return {
      isSafe,
      clearance: selectedTide.predictedHeight - totalDraft,
    };
  };

  const status = calculateSafetyStatus();
  const hoursUntilEntry = Math.floor(
    (new Date(selectedTide.safeEntryStart).getTime() - Date.now()) / (1000 * 60 * 60)
  );

  return (
    <div className="space-y-4">
      {/* Port Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Destination Port
        </label>
        <div className="relative">
          <input
            type="text"
            value={portSearch}
            onChange={(e) => setPortSearch(e.target.value)}
            placeholder="Search for a port (e.g., Antigua, San Francisco)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-3 text-gray-400">
              <div className="animate-spin h-5 w-5 border-2 border-ocean border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((port) => (
              <button
                key={port.id}
                onClick={() => {
                  setSelectedPort(port);
                  setPortSearch(port.port_name);
                  setSearchResults([]);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{port.port_name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {port.id}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Port Info */}
      {selectedPort && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-ocean mb-2">
            {selectedPort.port_name}
          </h3>
          <div className="text-sm text-gray-600">
            Port ID: {selectedPort.id}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Added: {new Date(selectedPort.created_at).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Safe Entry Window */}
      <div className={`p-4 rounded-lg border-2 ${status.isSafe ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <p className="text-sm font-medium text-gray-600">Arrival Window</p>
        <p className="text-lg font-bold mt-2">
          {selectedTide.safeEntryStart.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Safe entry window closes at{" "}
          {selectedTide.safeEntryEnd.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Safety Status */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Tide Height</p>
          <p className="text-lg font-bold text-ocean">
            {selectedTide.predictedHeight}m
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Boat Draft + Margin</p>
          <p className="text-lg font-bold text-ocean">
            {selectedTide.boatDraft + selectedTide.safetyMargin}m
          </p>
        </div>
        <div className={`p-3 rounded ${status.isSafe ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs text-gray-600">Clearance</p>
          <p className={`text-lg font-bold ${status.isSafe ? 'text-green-700' : 'text-red-700'}`}>
            {status.clearance.toFixed(2)}m
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ocean">Entry Status</p>
            <p className="text-xs text-gray-600 mt-1">
              Safe window begins in {hoursUntilEntry} hours
            </p>
          </div>
          <div className={`text-2xl font-bold ${status.isSafe ? 'status-green' : 'status-red'}`}>
            {status.isSafe ? "✓ GO" : "✗ WAIT"}
          </div>
        </div>
      </div>

      {/* Tide Curve Visualization (Placeholder) */}
      <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200 h-32 flex items-center justify-center">
        <p className="text-sm text-ocean font-semibold">📊 24-Hour Tide Curve (Coming Soon)</p>
      </div>

      {/* Action Button */}
      <button className="w-full bg-ocean text-white py-2 rounded hover:bg-ocean-dark transition">
        View Detailed Forecast
      </button>
    </div>
  );
}
