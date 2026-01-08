"use client";

import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    disabled?: boolean;
}

export function OTPInput({
    length = 6,
    value,
    onChange,
    onComplete,
    disabled = false
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const digits = value.split('').slice(0, length);
    while (digits.length < length) {
        digits.push('');
    }

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        // Only allow single digit
        const newDigit = digit.slice(-1);

        // Only allow numbers
        if (newDigit && !/^\d$/.test(newDigit)) return;

        const newDigits = [...digits];
        newDigits[index] = newDigit;
        const newValue = newDigits.join('');

        onChange(newValue);

        // Auto-focus next input
        if (newDigit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Call onComplete if all digits are filled
        if (newValue.length === length && onComplete) {
            onComplete(newValue);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        // Handle backspace
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // If current input is empty, focus previous and clear it
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                onChange(newDigits.join(''));
            }
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').slice(0, length);

        // Only allow numbers
        const digits = pastedData.replace(/\D/g, '');

        if (digits) {
            onChange(digits);

            // Focus the last filled input or the next empty one
            const nextIndex = Math.min(digits.length, length - 1);
            inputRefs.current[nextIndex]?.focus();

            // Call onComplete if all digits are filled
            if (digits.length === length && onComplete) {
                onComplete(digits);
            }
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {digits.map((digit, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Input
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={disabled}
                        className={`
                            w-12 h-14 text-center text-2xl font-bold
                            bg-slate-800/50 border-slate-700 text-white
                            transition-all duration-200
                            ${focusedIndex === index
                                ? 'border-purple-500 ring-2 ring-purple-500/20 scale-105'
                                : 'hover:border-slate-600'
                            }
                            ${digit ? 'border-purple-500/50' : ''}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    />
                </motion.div>
            ))}
        </div>
    );
}
