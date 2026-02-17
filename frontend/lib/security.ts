/**
 * Paxx Security Layer (Zero-Knowledge)
 * 
 * This module handles all client-side cryptographic operations.
 * It ensures that the Master Password and unencrypted data never leave the browser.
 */

const PBKDF2_ITERATIONS = 600000;
const AUTH_ITERATIONS = 100000; // Separate iterations for auth to prevent master key exposure
const AES_GCM_TAG_LENGTH = 128;
const ENC_ALGO = "AES-GCM";

/**
 * Derives a cryptographic key from a master password and salt.
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
        "raw",
        passwordData,
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as any,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        { name: ENC_ALGO, length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Derives an authentication hash to be used as the "password" for Supabase.
 * This ensures the actual master password is never sent.
 */
export async function deriveAuthHash(password: string, salt: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
        "raw",
        passwordData,
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt as any,
            iterations: AUTH_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        256
    );

    return arrayToBase64(new Uint8Array(derivedBits));
}

/**
 * Encrypts a string using AES-256-GCM.
 */
export async function encrypt(text: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
        {
            name: ENC_ALGO,
            iv: iv,
        },
        key,
        data
    );

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}

/**
 * Decrypts a base64 ciphertext using AES-256-GCM.
 */
export async function decrypt(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
    const encryptedData = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        {
            name: ENC_ALGO,
            iv: ivData,
        },
        key,
        encryptedData
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * Generates a random salt.
 */
export function generateSalt(length = 32): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Converts a Uint8Array to a Base64 string for storage.
 */
export function arrayToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer));
}

/**
 * Converts a Base64 string back to a Uint8Array.
 */
export function base64ToArray(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
