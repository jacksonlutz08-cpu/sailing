// Common user type
export interface User {
  id: string;
  email: string;
  name: string;
  boatLength: number; // in feet
  homePort: string;
  passportNumber: string;
}

// Document types
export type DocumentType = "registration" | "passport" | "insurance" | "zarpe" | "health_declaration" | "customs" | "port_clearance";

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  countryTags: string[];
  expiryDate: Date;
  fileName: string;
  encryptedBlob: string; // AES-256 encrypted
  uploadedAt: Date;
}

// Country requirements
export interface CountryRequirement {
  countryCode: string;
  countryName: string;
  requiredDocuments: DocumentType[];
  specialNotes?: string;
  port?: string;
}

// Vessel maintenance
export interface MaintenanceRecord {
  id: string;
  partName: string;
  lastServiceHours: number;
  intervalHours: number;
  stockLevel: number;
  nextServiceDue: number;
}

// Budget tracking
export interface BudgetLeg {
  id: string;
  passageId: string;
  startPort: string;
  endPort: string;
  fuelEstimate: number;
  visaFees: number;
  foodBuffer: number;
  currency: string;
  actualSpent: number;
}

// Tide data
export interface TidePoint {
  time: Date;
  height: number;
}

export interface TideWindow {
  port: string;
  safeEntryStart: Date;
  safeEntryEnd: Date;
  predictedHeight: number;
  boatDraft: number;
  safetyMargin: number;
}
