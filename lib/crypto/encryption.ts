/**
 * Client-side AES-256 encryption using Web Crypto API
 * Users hold the master key; data is encrypted before being sent to Supabase
 */

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

/**
 * Generate a master encryption key from a password
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 } as AesDerivedKeyParams,
    false,
    ["encrypt", "decrypt"] as KeyUsage[]
  );
}

/**
 * Encrypt plaintext using AES-256-GCM
 */
export async function encryptData(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  // Convert to base64 for storage
  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  const ivStr = btoa(String.fromCharCode(...iv));

  return {
    ciphertext,
    iv: ivStr,
    salt: "", // Will be set at a higher level
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export async function decryptData(
  encrypted: EncryptedData,
  key: CryptoKey
): Promise<string> {
  const iv = Uint8Array.from(atob(encrypted.iv), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encrypted.ciphertext), (c) =>
    c.charCodeAt(0)
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Convert salt to base64 for storage
 */
export function saltToBase64(salt: Uint8Array): string {
  return btoa(String.fromCharCode(...salt));
}

/**
 * Convert base64 salt back to Uint8Array
 */
export function base64ToSalt(saltStr: string): Uint8Array {
  return Uint8Array.from(atob(saltStr), (c) => c.charCodeAt(0));
}
