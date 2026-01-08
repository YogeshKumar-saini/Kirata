"use client";

import { useTheme } from "@/context/theme-context";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function DynamicBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Use springs for smoother mouse movement
    const mouseX = useSpring(0, { stiffness: 100, damping: 30 });
    const mouseY = useSpring(0, { stiffness: 100, damping: 30 });

    // Move useMotionTemplate clearly to the top level, always called.
    // We'll use conditional logic inside the template or separate templates if needed, 
    // but for stability, keep hook calls consistent.

    // Dark Mode Gradient
    const darkGradient = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(109, 40, 217, 0.15),
      transparent 80%
    )
  `;

    // Light Mode Gradient - Softer, warmer, more subtle
    const lightGradient = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(139, 92, 246, 0.1), /* Lighter Violet */
      transparent 80%
    )
  `;

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Base Background */}
            <div className={`absolute inset-0 transition-colors duration-500 ease-in-out ${theme === 'dark' ? 'bg-[#0d0b14]' : 'bg-[#fafafa]'
                }`} />

            {/* Primary User Follow Gradient */}
            <motion.div
                className="absolute inset-0 opacity-50"
                style={{
                    background: theme === 'dark' ? darkGradient : lightGradient,
                }}
            />

            {/* Secondary Ambient Blobs */}
            {theme === 'dark' ? (
                <>
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] mix-blend-screen animate-pulse delay-1000" />
                </>
            ) : (
                <>
                    {/* Light Mode Blobs - Warmer and softer */}
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-[120px] mix-blend-multiply animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-[120px] mix-blend-multiply animate-pulse delay-1000" />
                </>
            )}

            {/* Texture Overlay (Optional for 'World Class' feel - subtle noise) */}
            <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
}
