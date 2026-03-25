import { Document, CountryRequirement, MaintenanceRecord, BudgetLeg, TideWindow } from "@/types";

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc_1",
    userId: "user_123",
    type: "passport",
    countryTags: ["AU", "NZ", "FJ"],
    expiryDate: new Date("2026-12-31"),
    fileName: "passport.pdf",
    encryptedBlob: "encrypted_data_here",
    uploadedAt: new Date("2024-01-15"),
  },
  {
    id: "doc_2",
    userId: "user_123",
    type: "registration",
    countryTags: ["AU"],
    expiryDate: new Date("2025-06-30"),
    fileName: "boat_registration.pdf",
    encryptedBlob: "encrypted_data_here",
    uploadedAt: new Date("2024-02-20"),
  },
  {
    id: "doc_3",
    userId: "user_123",
    type: "insurance",
    countryTags: ["AU", "NZ", "FJ", "US"],
    expiryDate: new Date("2025-03-12"), // Expiring soon!
    fileName: "boat_insurance.pdf",
    encryptedBlob: "encrypted_data_here",
    uploadedAt: new Date("2024-03-01"),
  },
];

export const MOCK_COUNTRY_REQUIREMENTS: CountryRequirement[] = [
  {
    countryCode: "AU",
    countryName: "Australia",
    requiredDocuments: ["passport", "registration", "insurance", "customs"],
    specialNotes: "Biosecurity declaration required. AMS entry mandatory.",
  },
  {
    countryCode: "NZ",
    countryName: "New Zealand",
    requiredDocuments: ["passport", "registration", "insurance", "customs"],
    specialNotes: "Quarantine inspection required for fresh provisions.",
  },
  {
    countryCode: "FJ",
    countryName: "Fiji",
    requiredDocuments: ["passport", "zarpe", "health_declaration", "insurance"],
    specialNotes: "Zarpe (port clearance) required. Cash in FJD recommended.",
  },
];

export const MOCK_MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  {
    id: "maint_1",
    partName: "Main Engine",
    lastServiceHours: 450,
    intervalHours: 500,
    stockLevel: 2, // oil filters
    nextServiceDue: 50,
  },
  {
    id: "maint_2",
    partName: "Prop Shaft",
    lastServiceHours: 200,
    intervalHours: 1000,
    stockLevel: 1,
    nextServiceDue: 800,
  },
  {
    id: "maint_3",
    partName: "Water Pump",
    lastServiceHours: 320,
    intervalHours: 600,
    stockLevel: 0, // Out of stock!
    nextServiceDue: 280,
  },
];

export const MOCK_BUDGET_LEG: BudgetLeg = {
  id: "leg_1",
  passageId: "passage_1",
  startPort: "Sydney, AU",
  endPort: "Fiji",
  fuelEstimate: 1200,
  visaFees: 50,
  foodBuffer: 400,
  currency: "AUD",
  actualSpent: 850,
};

export const MOCK_TIDE_WINDOWS: TideWindow[] = [
  {
    port: "Suva, Fiji",
    safeEntryStart: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h from now
    safeEntryEnd: new Date(Date.now() + 15 * 60 * 60 * 1000), // 15h from now
    predictedHeight: 2.5,
    boatDraft: 1.8,
    safetyMargin: 0.6,
  },
];

export const MOCK_EXCHANGE_RATES: Record<string, number> = {
  AUD: 1.0,
  USD: 0.65,
  EUR: 0.58,
  GBP: 0.51,
  FJD: 1.48,
  XPF: 70.5,
  ECD: 1.75,
  NZD: 1.08,
};
