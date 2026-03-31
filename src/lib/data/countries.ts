/**
 * Country Codes Data
 * Common countries with their dial codes and flags
 */

export interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

export const countries = [
    { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
    { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
    { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
    { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'BE', dialCode: '+32', name: 'Belgium', flag: '🇧🇪' },
    { code: 'SE', dialCode: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', dialCode: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: 'DK', dialCode: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: 'FI', dialCode: '+358', name: 'Finland', flag: '🇫🇮' },
    { code: 'PL', dialCode: '+48', name: 'Poland', flag: '🇵🇱' },
    { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AT', dialCode: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪' },
    { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' },
] as const;

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
    return countries.find(c => c.dialCode === dialCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
    return countries.find(c => c.code === code);
};
