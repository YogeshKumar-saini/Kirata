"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessAnimationProps {
    show: boolean;
    message?: string;
    onComplete?: () => void;
    autoHideDuration?: number;
}

export function SuccessAnimation({
    show,
    message = "Success!",
    onComplete,
    autoHideDuration = 3000
}: SuccessAnimationProps) {
    useEffect(() => {
        if (show) {
            // Trigger confetti
            const duration = 2000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 },
                    colors: ['#a855f7', '#3b82f6', '#06b6d4']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 },
                    colors: ['#a855f7', '#3b82f6', '#06b6d4']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Auto-hide and call onComplete
            const timer = setTimeout(() => {
                if (onComplete) {
                    setTimeout(onComplete, 300); // Wait for exit animation
                }
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete, autoHideDuration]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                        }}
                        className="relative"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-3xl opacity-50 animate-pulse" />

                        {/* Main content */}
                        <div className="relative bg-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl">
                            <div className="flex flex-col items-center gap-4">
                                {/* Animated checkmark */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-50" />
                                    <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </div>
                                </motion.div>

                                {/* Message */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center"
                                >
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 justify-center">
                                        <Sparkles className="w-6 h-6 text-yellow-400" />
                                        {message}
                                    </h3>
                                    <p className="text-gray-400 text-sm">Redirecting you now...</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
