import crypto from 'crypto';

// Password hashing utilities with fallback
let argon2: any = null;
let argon2Error: Error | null = null;

// Try to load argon2 dynamically with safer error handling
async function loadArgon2() {
  if (argon2 !== null || argon2Error !== null) {
    return argon2 !== null;
  }

  try {
    // Only load argon2 on server-side
    if (typeof window !== 'undefined') {
      argon2Error = new Error('Argon2 not available in browser');
      return false;
    }

    // Dynamic import to avoid bundling issues
    argon2 = require('argon2');

    // Test if argon2 functions are available
    if (typeof argon2.hash !== 'function' || typeof argon2.verify !== 'function') {
      throw new Error('Argon2 functions not available');
    }

    console.log('[PasswordHash] Argon2 loaded successfully');
    return true;
  } catch (error) {
    argon2Error = error as Error;
    console.warn('[PasswordHash] Argon2 not available, using fallback:', argon2Error?.message);
    argon2 = null; // Ensure argon2 is null on error
    return false;
  }
}

// Initialize argon2 on module load
const argon2Promise = loadArgon2();

/**
 * Hash a password using Argon2 if available, otherwise fallback to PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Wait for argon2 to load
    const hasArgon2 = await argon2Promise;

    if (hasArgon2 && argon2) {
      try {
        return await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16, // 64 MB
          timeCost: 3,
          parallelism: 1,
        });
      } catch (argonError) {
        console.warn('[PasswordHash] Argon2 hashing failed, using fallback:', argonError);
        // Fall back to PBKDF2 if argon2 fails
      }
    }

    // Fallback to PBKDF2 (still secure, but less memory-hard than Argon2)
    console.log('[PasswordHash] Using PBKDF2 fallback for password hashing');
    const salt = crypto.randomBytes(32);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return `pbkdf2_${salt.toString('hex')}_${hash.toString('hex')}`;
  } catch (error) {
    console.error('[PasswordHash] Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password hash created by either Argon2 or PBKDF2
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Wait for argon2 to load
    const hasArgon2 = await argon2Promise;

    // Try Argon2 verification first if the hash looks like Argon2
    if (hasArgon2 && argon2 && !hash.startsWith('pbkdf2_')) {
      try {
        return await argon2.verify(hash, password);
      } catch (argonError) {
        console.warn('[PasswordHash] Argon2 verification failed, trying fallback:', argonError);
        // Fall back to PBKDF2 verification if argon2 fails
      }
    }

    // PBKDF2 verification
    if (hash.startsWith('pbkdf2_')) {
      try {
        const parts = hash.split('_');
        if (parts.length !== 3) {
          throw new Error('Invalid PBKDF2 hash format');
        }

        const salt = Buffer.from(parts[1], 'hex');
        const hashBuffer = Buffer.from(parts[2], 'hex');
        const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

        return crypto.timingSafeEqual(hashBuffer, computedHash);
      } catch (pbkdf2Error) {
        console.error('[PasswordHash] PBKDF2 verification error:', pbkdf2Error);
        return false;
      }
    }

    // If we can't verify the hash, return false
    console.warn('[PasswordHash] Unable to verify password hash format');
    return false;
  } catch (error) {
    console.error('[PasswordHash] Password verification error:', error);
    return false;
  }
}

/**
 * Check if Argon2 is available
 */
export async function isArgon2Available(): Promise<boolean> {
  const hasArgon2 = await argon2Promise;
  return hasArgon2 && argon2 !== null;
}

/**
 * Get information about which hashing method is being used
 */
export async function getHashingInfo(): Promise<{ method: 'argon2' | 'pbkdf2'; available: boolean }> {
  const hasArgon2 = await argon2Promise;
  return {
    method: hasArgon2 && argon2 ? 'argon2' : 'pbkdf2',
    available: hasArgon2 && argon2 !== null
  };
}