"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
    { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

export function PasswordStrengthIndicator({
    password,
    showRequirements = true
}: PasswordStrengthIndicatorProps) {
    const strength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };

        const passed = requirements.filter(req => req.test(password)).length;
        const score = (passed / requirements.length) * 100;

        if (score < 40) {
            return { score, label: 'Weak', color: 'from-red-500 to-rose-600' };
        } else if (score < 60) {
            return { score, label: 'Fair', color: 'from-orange-500 to-yellow-600' };
        } else if (score < 80) {
            return { score, label: 'Good', color: 'from-yellow-500 to-green-500' };
        } else {
            return { score, label: 'Strong', color: 'from-green-500 to-emerald-600' };
        }
    }, [password]);

    if (!password) return null;

    return (
        <div className="space-y-3">
            {/* Strength Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Password Strength</span>
                    <span className={`font-semibold bg-gradient-to-r ${strength.color} bg-clip-text text-transparent`}>
                        {strength.label}
                    </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${strength.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.score}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            {showRequirements && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                >
                    {requirements.map((req, index) => {
                        const passed = req.test(password);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-2 text-sm"
                            >
                                <div className={`
                                    w-4 h-4 rounded-full flex items-center justify-center
                                    ${passed
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-slate-700 text-gray-500'
                                    }
                                    transition-all duration-200
                                `}>
                                    {passed ? (
                                        <Check className="w-3 h-3" />
                                    ) : (
                                        <X className="w-3 h-3" />
                                    )}
                                </div>
                                <span className={`
                                    ${passed ? 'text-gray-300' : 'text-gray-500'}
                                    transition-colors duration-200
                                `}>
                                    {req.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
