import React from 'react';
import { Input } from '@/components/ui/input';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    countryCode: string;
    onCountryCodeChange: (code: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const countryCodes = [
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+82', country: 'KR', flag: '🇰🇷' },
    { code: '+65', country: 'SG', flag: '🇸🇬' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
];

export function PhoneInput({
    value,
    onChange,
    countryCode,
    onCountryCodeChange,
    placeholder = '99999 99999',
    required = false,
    className = '',
}: PhoneInputProps) {
    const formatPhoneNumber = (input: string) => {
        // Remove all non-digits
        const digits = input.replace(/\D/g, '');

        // Format based on country code
        if (countryCode === '+91') {
            // Indian format: XXXXX XXXXX
            if (digits.length <= 5) return digits;
            return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
        } else if (countryCode === '+1') {
            // US format: (XXX) XXX-XXXX
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        } else {
            // Default format: space every 3-4 digits
            if (digits.length <= 4) return digits;
            if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        onChange(formatted);
    };

    return (
        <div className="relative group">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors z-10" />

            {/* Country Code Selector */}
            <select
                value={countryCode}
                onChange={(e) => onCountryCodeChange(e.target.value)}
                className="absolute left-11 top-1/2 -translate-y-1/2 bg-transparent border-none text-white font-medium text-sm focus:outline-none focus:ring-0 cursor-pointer z-10 pr-1"
                style={{ width: 'auto' }}
            >
                {countryCodes.map((item) => (
                    <option key={item.code} value={item.code} className="bg-slate-800 text-white">
                        {item.flag} {item.code}
                    </option>
                ))}
            </select>

            {/* Phone Number Input */}
            <Input
                type="tel"
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={handleChange}
                className={`h-12 pl-[120px] bg-slate-800/50 border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder:text-gray-500 ${className}`}
            />
        </div>
    );
}
