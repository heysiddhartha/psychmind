/**
 * Encryption Service - End-to-End Message Encryption
 * Uses Web Crypto API for secure client-side encryption
 */

// ==========================================
// Types
// ==========================================

export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
}

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

// ==========================================
// Constants
// ==========================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

// ==========================================
// Key Management
// ==========================================

/**
 * Generate a new encryption key for a conversation
 * This key should be stored securely and shared between participants
 */
export async function generateConversationKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Export a CryptoKey to a storable string format
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(exported);
}

/**
 * Import a key from stored string format
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(keyString);
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Derive a key from a password/passphrase using PBKDF2
 * Useful for user-based key derivation
 */
export async function deriveKeyFromPassword(
    password: string,
    salt: string
): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

// ==========================================
// Encryption / Decryption
// ==========================================

/**
 * Encrypt a message using AES-GCM
 */
export async function encryptMessage(
    message: string,
    key: CryptoKey
): Promise<EncryptedPayload> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv,
        },
        key,
        data
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv),
    };
}

/**
 * Decrypt a message using AES-GCM
 */
export async function decryptMessage(
    encryptedPayload: EncryptedPayload,
    key: CryptoKey
): Promise<string> {
    const ciphertext = base64ToArrayBuffer(encryptedPayload.ciphertext);
    const iv = base64ToArrayBuffer(encryptedPayload.iv);

    try {
        const decrypted = await crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv,
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt message. Key may be incorrect.');
    }
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return arrayBufferToBase64(salt);
}

/**
 * Hash a string using SHA-256 (for key fingerprints)
 */
export async function hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
}

// ==========================================
// Conversation Key Storage (LocalStorage with encryption)
// ==========================================

const KEY_STORAGE_PREFIX = '3tree_conv_key_';

/**
 * Store a conversation key locally (encrypted with user's master key)
 */
export async function storeConversationKey(
    conversationId: string,
    key: CryptoKey,
    masterKey: CryptoKey
): Promise<void> {
    const exportedKey = await exportKey(key);
    const encrypted = await encryptMessage(exportedKey, masterKey);
    localStorage.setItem(
        `${KEY_STORAGE_PREFIX}${conversationId}`,
        JSON.stringify(encrypted)
    );
}

/**
 * Retrieve a conversation key from local storage
 */
export async function retrieveConversationKey(
    conversationId: string,
    masterKey: CryptoKey
): Promise<CryptoKey | null> {
    const stored = localStorage.getItem(`${KEY_STORAGE_PREFIX}${conversationId}`);
    if (!stored) return null;

    try {
        const encrypted = JSON.parse(stored) as EncryptedPayload;
        const keyString = await decryptMessage(encrypted, masterKey);
        return await importKey(keyString);
    } catch (error) {
        console.error('Failed to retrieve conversation key:', error);
        return null;
    }
}

/**
 * Generate a master key from user's password
 * This should be called once when user logs in
 */
export async function generateMasterKey(
    userId: string,
    password: string
): Promise<CryptoKey> {
    // Use userId as salt for deterministic key derivation
    return await deriveKeyFromPassword(password, `3tree_master_${userId}`);
}

// ==========================================
// High-Level API for Message Encryption
// ==========================================

/**
 * Encrypt a chat message for sending
 */
export async function encryptChatMessage(
    content: string,
    conversationId: string,
    masterKey: CryptoKey
): Promise<{ encryptedContent: string; iv: string } | null> {
    try {
        // Get or create conversation key
        let convKey = await retrieveConversationKey(conversationId, masterKey);

        if (!convKey) {
            // First message in conversation - generate new key
            convKey = await generateConversationKey();
            await storeConversationKey(conversationId, convKey, masterKey);
        }

        const encrypted = await encryptMessage(content, convKey);
        return {
            encryptedContent: encrypted.ciphertext,
            iv: encrypted.iv,
        };
    } catch (error) {
        console.error('Failed to encrypt message:', error);
        return null;
    }
}

/**
 * Decrypt a received chat message
 */
export async function decryptChatMessage(
    encryptedContent: string,
    iv: string,
    conversationId: string,
    masterKey: CryptoKey
): Promise<string | null> {
    try {
        const convKey = await retrieveConversationKey(conversationId, masterKey);
        if (!convKey) {
            console.error('No key found for conversation');
            return null;
        }

        return await decryptMessage({ ciphertext: encryptedContent, iv }, convKey);
    } catch (error) {
        console.error('Failed to decrypt message:', error);
        return null;
    }
}

export default {
    generateConversationKey,
    exportKey,
    importKey,
    encryptMessage,
    decryptMessage,
    encryptChatMessage,
    decryptChatMessage,
    generateMasterKey,
    generateSalt,
    hashString,
};
