"use client";

import { motion } from "framer-motion";

interface SectionDividerProps {
    variant?: "wave" | "gradient" | "dots" | "line";
    className?: string;
}

export function SectionDivider({ variant = "gradient", className = "" }: SectionDividerProps) {
    if (variant === "wave") {
        return (
            <div className={`relative h-24 w-full overflow-hidden ${className}`}>
                <svg
                    className="absolute bottom-0 w-full h-full"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M0,0 C300,100 900,20 1200,80 L1200,120 L0,120 Z"
                        fill="url(#waveGradient)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 0.3 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    }

    if (variant === "dots") {
        return (
            <div className={`flex justify-center items-center py-12 ${className}`}>
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "line") {
        return (
            <div className={`flex justify-center py-12 ${className}`}>
                <motion.div
                    className="h-px w-64 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />
            </div>
        );
    }

    // Default: gradient
    return (
        <div className={`relative h-px w-full ${className}`}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            />
        </div>
    );
}
