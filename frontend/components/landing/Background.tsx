"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Background() {
    return (
        <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-background">
            {/* 
              FLUID GRADIENT ORBS 
              Using framer-motion for smooth, infinite floating animations.
            */}

            {/* Orb 1: Deep Purple (Top Left) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-purple-900/30 blur-[120px] mix-blend-screen"
            />

            {/* Orb 2: Deep Blue (Top Right / Center) */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[-10%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-blue-900/20 blur-[130px] mix-blend-screen"
            />

            {/* Orb 3: Vibrant Indigo (Bottom Left) */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 40, 0],
                    y: [0, -40, 0],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[140px] mix-blend-screen"
            />

            {/* Orb 4: Subtle Cyan Pulse (Bottom Right) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 10
                }}
                className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/10 blur-[150px] mix-blend-screen"
            />

            {/* Noise Texture Overlay for "Premium Paper" feel */}
            <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Vignette to focus center */}
            <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, #030014 90%) opacity-80" />
        </div>
    );
}
