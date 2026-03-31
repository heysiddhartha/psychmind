/**
 * Rate Limiter Utility
 * Provides rate limiting for authentication attempts and other sensitive operations
 */

interface RateLimitEntry {
    count: number;
    firstAttempt: number;
    blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block after max attempts

/**
 * Check if an action is rate limited
 * @param key - Unique identifier (e.g., email, IP, user ID)
 * @param maxAttempts - Maximum attempts allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns Object with allowed status and remaining info
 */
export function checkRateLimit(
    key: string,
    maxAttempts: number = MAX_ATTEMPTS,
    windowMs: number = WINDOW_MS
): { allowed: boolean; remainingAttempts: number; blockedUntil?: Date; message?: string } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // If blocked, check if block has expired
    if (entry?.blockedUntil) {
        if (now < entry.blockedUntil) {
            const remainingMinutes = Math.ceil((entry.blockedUntil - now) / 60000);
            return {
                allowed: false,
                remainingAttempts: 0,
                blockedUntil: new Date(entry.blockedUntil),
                message: `Account temporarily locked. Try again in ${remainingMinutes} minutes.`
            };
        }
        // Block expired, reset
        rateLimitStore.delete(key);
    }

    // If no entry or window expired, allow
    if (!entry || (now - entry.firstAttempt) > windowMs) {
        return {
            allowed: true,
            remainingAttempts: maxAttempts - 1
        };
    }

    // Check if within limits
    if (entry.count < maxAttempts) {
        return {
            allowed: true,
            remainingAttempts: maxAttempts - entry.count - 1
        };
    }

    // Max attempts reached
    return {
        allowed: false,
        remainingAttempts: 0,
        message: 'Too many attempts. Please try again later.'
    };
}

/**
 * Record an attempt (call after a failed action)
 * @param key - Unique identifier
 * @param success - Whether the attempt was successful
 */
export function recordAttempt(key: string, success: boolean = false): void {
    if (success) {
        // Reset on success
        rateLimitStore.delete(key);
        return;
    }

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || (now - entry.firstAttempt) > WINDOW_MS) {
        // Start new window
        rateLimitStore.set(key, {
            count: 1,
            firstAttempt: now
        });
        return;
    }

    // Increment count
    const newCount = entry.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
        // Block the user
        rateLimitStore.set(key, {
            ...entry,
            count: newCount,
            blockedUntil: now + BLOCK_DURATION_MS
        });
    } else {
        rateLimitStore.set(key, {
            ...entry,
            count: newCount
        });
    }
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

/**
 * Get remaining attempts for a key
 */
export function getRemainingAttempts(key: string): number {
    const result = checkRateLimit(key);
    return result.remainingAttempts;
}

// Clean up old entries periodically (every 5 minutes)
if (typeof window !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            // Remove entries older than 1 hour
            if ((now - entry.firstAttempt) > 60 * 60 * 1000) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

export default {
    checkRateLimit,
    recordAttempt,
    clearRateLimit,
    getRemainingAttempts
};
