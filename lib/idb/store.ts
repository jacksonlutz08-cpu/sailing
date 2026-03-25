/**
 * IndexedDB Store for BlueHorizon
 * 
 * Stores encrypted documents and logbook entries locally.
 * Syncs with Supabase when connection returns.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface BlueHorizonDB extends DBSchema {
  vault: {
    key: string;
    value: {
      id: string;
      userId: string;
      type: string;
      encrypted: string;
      expiryDate: string;
      syncedAt?: string;
    };
  };
  logbook: {
    key: string;
    value: {
      id: string;
      timestamp: string;
      gps: { lat: number; lon: number };
      wind: { speed: number; direction: number };
      depth: number;
      syncedAt?: string;
    };
  };
  expenses: {
    key: string;
    value: {
      id: string;
      amount: number;
      currency: string;
      description: string;
      timestamp: string;
      syncedAt?: string;
    };
  };
}

let db: IDBPDatabase<BlueHorizonDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<BlueHorizonDB>> {
  if (db) return db;

  db = await openDB<BlueHorizonDB>("bluehorizon", 1, {
    upgrade(db) {
      // Vault store
      if (!db.objectStoreNames.contains("vault")) {
        db.createObjectStore("vault", { keyPath: "id" });
      }

      // Logbook store (auto-logging from Signal K)
      if (!db.objectStoreNames.contains("logbook")) {
        db.createObjectStore("logbook", { keyPath: "id" });
      }

      // Expenses store
      if (!db.objectStoreNames.contains("expenses")) {
        db.createObjectStore("expenses", { keyPath: "id" });
      }
    },
  });

  return db;
}

// Vault operations
export async function saveEncryptedDocument(docId: string, data: any) {
  const db = await initDB();
  await db.put("vault", { id: docId, ...data });
}

export async function getEncryptedDocument(docId: string) {
  const db = await initDB();
  return db.get("vault", docId);
}

export async function getAllVaultDocs() {
  const db = await initDB();
  return db.getAll("vault");
}

export async function deleteVaultDoc(docId: string) {
  const db = await initDB();
  await db.delete("vault", docId);
}

// Logbook operations (automated from Signal K)
export async function logEntry(entry: any) {
  const db = await initDB();
  const id = `log_${Date.now()}`;
  await db.put("logbook", { id, ...entry, timestamp: new Date().toISOString() });
  return id;
}

export async function getLogbookEntries(limit = 100) {
  const db = await initDB();
  const allLogs = await db.getAll("logbook");
  return allLogs.slice(-limit);
}

export async function getUnsyncedLogbook() {
  const db = await initDB();
  const allLogs = await db.getAll("logbook");
  return allLogs.filter((log) => !log.syncedAt);
}

export async function markLogbookSynced(logIds: string[]) {
  const db = await initDB();
  for (const id of logIds) {
    const log = await db.get("logbook", id);
    if (log) {
      log.syncedAt = new Date().toISOString();
      await db.put("logbook", log);
    }
  }
}

// Expense tracking
export async function recordExpense(amount: number, currency: string, description: string) {
  const db = await initDB();
  const id = `exp_${Date.now()}`;
  await db.put("expenses", {
    id,
    amount,
    currency,
    description,
    timestamp: new Date().toISOString(),
  });
  return id;
}

export async function getUnsyncedExpenses() {
  const db = await initDB();
  const allExpenses = await db.getAll("expenses");
  return allExpenses.filter((exp) => !exp.syncedAt);
}

export async function markExpenseSynced(expIds: string[]) {
  const db = await initDB();
  for (const id of expIds) {
    const exp = await db.get("expenses", id);
    if (exp) {
      exp.syncedAt = new Date().toISOString();
      await db.put("expenses", exp);
    }
  }
}

// Sync function: Sends unsynced data to server
export async function deltaSyncToServer(apiEndpoint: string) {
  try {
    const unsynced = {
      logbook: await getUnsyncedLogbook(),
      expenses: await getUnsyncedExpenses(),
    };

    if (unsynced.logbook.length === 0 && unsynced.expenses.length === 0) {
      return { synced: false, reason: "No unsynced data" };
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unsynced),
    });

    if (response.ok) {
      await markLogbookSynced(unsynced.logbook.map((l) => l.id));
      await markExpenseSynced(unsynced.expenses.map((e) => e.id));
      return { synced: true, count: unsynced.logbook.length + unsynced.expenses.length };
    }
  } catch (error) {
    console.error("[IDBStore] Delta sync failed:", error);
    return { synced: false, error };
  }
}
