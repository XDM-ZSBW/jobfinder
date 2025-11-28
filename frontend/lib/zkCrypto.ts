/**
 * Zero-Knowledge Cryptography Library
 * Client-side encryption using PBKDF2 + AES-256
 * Based on Bitwarden's architecture
 */

import CryptoJS from 'crypto-js';

const PBKDF2_ITERATIONS = 100000; // Industry standard
const KEY_SIZE = 256 / 32; // 256-bit key

/**
 * Derive master encryption key from email + passphrase
 * This key is used to encrypt/decrypt user data
 * NEVER sent to server
 */
export async function deriveKey(
  email: string,
  passphrase: string,
  iterations: number = PBKDF2_ITERATIONS
): Promise<string> {
  // Use email as salt (unique per user)
  const salt = CryptoJS.enc.Utf8.parse(email.toLowerCase());
  
  // Derive key using PBKDF2
  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: KEY_SIZE,
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256
  });
  
  return key.toString();
}

/**
 * Generate authentication hash from master key + passphrase
 * This is what we send to server for login verification
 * Different from encryption key (single iteration)
 */
export async function deriveAuthHash(
  masterKey: string,
  passphrase: string
): Promise<string> {
  // Single iteration for auth hash (faster, different from encryption)
  const salt = CryptoJS.enc.Hex.parse(masterKey);
  const hash = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: KEY_SIZE,
    iterations: 1,
    hasher: CryptoJS.algo.SHA256
  });
  
  return hash.toString();
}

/**
 * Encrypt data with master key
 * Returns encrypted string that only client can decrypt
 */
export async function encrypt(
  data: any,
  key: string
): Promise<string> {
  const plaintext = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key);
  return encrypted.toString();
}

/**
 * Decrypt data with master key
 * Returns original data object
 */
export async function decrypt(
  ciphertext: string,
  key: string
): Promise<any> {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    return JSON.parse(plaintext);
  } catch (error) {
    throw new Error('Failed to decrypt profile. Wrong passphrase?');
  }
}

/**
 * Generate random string for testing
 */
export function generateRandomString(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate passphrase strength
 */
export function validatePassphrase(passphrase: string): {
  valid: boolean;
  message: string;
} {
  if (passphrase.length < 12) {
    return {
      valid: false,
      message: 'Passphrase must be at least 12 characters'
    };
  }
  
  if (passphrase.length > 128) {
    return {
      valid: false,
      message: 'Passphrase too long (max 128 characters)'
    };
  }
  
  // Check for complexity
  const hasUpper = /[A-Z]/.test(passphrase);
  const hasLower = /[a-z]/.test(passphrase);
  const hasNumber = /[0-9]/.test(passphrase);
  const hasSpecial = /[^A-Za-z0-9]/.test(passphrase);
  
  const complexityCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (complexityCount < 3) {
    return {
      valid: false,
      message: 'Passphrase must include at least 3 of: uppercase, lowercase, numbers, special characters'
    };
  }
  
  return {
    valid: true,
    message: 'Passphrase is strong'
  };
}

/**
 * Separate private fields from public capabilities
 * Private fields get encrypted, public fields sent as cleartext
 */
export function separatePrivatePublic(formData: Record<string, any>): {
  privateData: Record<string, any>;
  publicData: Record<string, any>;
} {
  const privatePatterns = [
    'name', 'first_name', 'last_name', 'full_name',
    'address', 'street', 'city', 'zip', 'postal',
    'phone', 'mobile', 'tel',
    'ssn', 'social_security',
    'dob', 'birth', 'birthday',
    'bio', 'notes', 'portfolio_url', 'contact'
  ];
  
  const publicPatterns = [
    'skills', 'experience', 'availability',
    'rate', 'industries', 'remote', 'hours',
    'timezone', 'currently_available'
  ];
  
  const privateData: Record<string, any> = {};
  const publicData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(formData)) {
    const keyLower = key.toLowerCase();
    
    // Check if private
    const isPrivate = privatePatterns.some(pattern => keyLower.includes(pattern));
    
    if (isPrivate) {
      privateData[key] = value;
    } else {
      publicData[key] = value;
    }
  }
  
  return { privateData, publicData };
}

/**
 * Session management
 */
export const session = {
  /**
   * Store session token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('zkSessionToken', token);
  },
  
  /**
   * Get session token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('zkSessionToken');
  },
  
  /**
   * Remove session token
   */
  clearToken(): void {
    localStorage.removeItem('zkSessionToken');
  },
  
  /**
   * Store encrypted profile (can't be decrypted without passphrase)
   */
  setEncryptedProfile(profile: string): void {
    localStorage.setItem('zkEncryptedProfile', profile);
  },
  
  /**
   * Get encrypted profile
   */
  getEncryptedProfile(): string | null {
    return localStorage.getItem('zkEncryptedProfile');
  },
  
  /**
   * Clear encrypted profile
   */
  clearEncryptedProfile(): void {
    localStorage.removeItem('zkEncryptedProfile');
  },
  
  /**
   * Store email (identifier only)
   */
  setEmail(email: string): void {
    localStorage.setItem('zkEmail', email);
  },
  
  /**
   * Get email
   */
  getEmail(): string | null {
    return localStorage.getItem('zkEmail');
  },
  
  /**
   * Clear all session data
   */
  clearAll(): void {
    this.clearToken();
    this.clearEncryptedProfile();
    localStorage.removeItem('zkEmail');
  },
  
  /**
   * Check if session exists
   */
  hasSession(): boolean {
    return !!this.getToken();
  }
};

export default {
  deriveKey,
  deriveAuthHash,
  encrypt,
  decrypt,
  generateRandomString,
  validatePassphrase,
  separatePrivatePublic,
  session
};
