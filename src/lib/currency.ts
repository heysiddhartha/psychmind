/**
 * Currency utilities for Indian Rupee (INR) formatting
 */

// Convert USD to INR (approximate rate: 1 USD = 83 INR)
export const usdToInr = (usd: number): number => {
    return Math.round(usd * 83);
};

// Format number as Indian Rupee
export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format number with Indian number system (lakhs, crores)
export const formatIndianNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
};

// Service prices in INR
export const SERVICE_PRICES = {
    INDIVIDUAL: 3500,
    COUPLES: 5000,
    FAMILY: 6500,
    GROUP: 2500,
} as const;

// Session durations in minutes
export const SESSION_DURATIONS = {
    INDIVIDUAL: 50,
    COUPLES: 60,
    FAMILY: 75,
    GROUP: 90,
} as const;

export type ServiceType = keyof typeof SERVICE_PRICES;
