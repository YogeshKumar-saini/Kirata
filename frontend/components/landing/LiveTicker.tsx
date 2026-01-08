"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star, UserPlus } from "lucide-react";
import React from "react";

// Mock Data for "Live" Feel
const events = [
    { icon: ShoppingBag, text: "New order placed in Mumbai", time: "Just now" },
    { icon: UserPlus, text: "Shop 'Kirana King' joined from Delhi", time: "2s ago" },
    { icon: Star, text: "Amit S. renewed Premium Plan", time: "5s ago" },
    { icon: ShoppingBag, text: "150 items sold in Bangalore", time: "12s ago" },
    { icon: UserPlus, text: "New shop registered in Pune", time: "20s ago" },
];

export function LiveTicker() {
    return (
        <div className="w-full bg-gradient-to-r from-black/60 via-purple-900/20 to-black/60 backdrop-blur-md overflow-hidden py-4">
            <div className="flex overflow-hidden relative w-full">
                {/* LIVE indicator */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                </div>

                <motion.div
                    className="flex gap-12 whitespace-nowrap pl-32"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                >
                    {[...events, ...events, ...events].map((event, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-400 px-4 py-1 rounded-full bg-white/5 backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                <event.icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-gray-200">{event.text}</span>
                            <span className="text-xs text-gray-600">• {event.time}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />
            </div>
        </div>
    );
}
