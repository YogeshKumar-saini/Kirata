"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Background() {
    return (
        <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-[#030014]">
            {/* 
              PREMIUM FLUID GRADIENT ORBS 
              Enhanced with stronger gradients and smoother animations
            */}

            {/* Orb 1: Deep Purple (Top Left) - Enhanced */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.6, 0.4],
                    x: [0, 60, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-purple-900/40 to-violet-900/30 blur-[140px] mix-blend-screen"
            />

            {/* Orb 2: Deep Blue (Top Right / Center) - Enhanced */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.35, 0.65, 0.35],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[-10%] right-[-20%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-bl from-blue-900/35 to-cyan-900/25 blur-[150px] mix-blend-screen"
            />

            {/* Orb 3: Vibrant Indigo (Bottom Left) - Enhanced */}
            <motion.div
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute bottom-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/25 blur-[160px] mix-blend-screen"
            />

            {/* Orb 4: Subtle Cyan-Pink Pulse (Bottom Right) - Enhanced */}
            <motion.div
                animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 32,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 10
                }}
                className="absolute bottom-[-20%] right-[-10%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-tl from-pink-900/20 to-cyan-900/15 blur-[170px] mix-blend-screen"
            />
            
            {/* Orb 5: Center Accent - New Premium Addition */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.15, 0.35, 0.15],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 7
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/20 to-blue-500/15 blur-[180px] mix-blend-screen"
            />

            {/* Premium Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Enhanced Vignette for depth */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(3, 0, 20, 0.4) 60%, rgba(3, 0, 20, 0.8) 100%)'
            }} />
        </div>
    );
}
