"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function DynamicBackground() {
    const { scrollYProgress } = useScroll();

    // Transform scroll progress to different background colors
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1],
        [
            "#030014", // Hero - Deep midnight
            "#0a0520", // Social Proof - Purple tint
            "#050318", // Stats - Slightly lighter
            "#0d0525", // Features - Purple-blue
            "#08041a", // Testimonials - Deep purple
            "#0a0520", // Pricing - Purple tint
            "#030014", // Footer - Back to midnight
        ]
    );

    const gradientOpacity = useTransform(
        scrollYProgress,
        [0, 0.2, 0.4, 0.6, 0.8, 1],
        [0.3, 0.5, 0.4, 0.6, 0.5, 0.3]
    );

    // Orb positions
    const purpleOrbTop = useTransform(scrollYProgress, [0, 1], ["10%", "80%"]);
    const purpleOrbLeft = useTransform(scrollYProgress, [0, 1], ["20%", "70%"]);
    const blueOrbTop = useTransform(scrollYProgress, [0, 1], ["60%", "20%"]);
    const blueOrbRight = useTransform(scrollYProgress, [0, 1], ["10%", "60%"]);
    const pinkOrbTop = useTransform(scrollYProgress, [0, 1], ["40%", "70%"]);
    const pinkOrbLeft = useTransform(scrollYProgress, [0, 1], ["60%", "20%"]);

    return (
        <>
            {/* Main background color transition */}
            <motion.div
                className="fixed inset-0 -z-50"
                style={{ backgroundColor }}
            />

            {/* Animated gradient overlays */}
            <motion.div
                className="fixed inset-0 -z-40 pointer-events-none"
                style={{ opacity: gradientOpacity }}
            >
                {/* Purple gradient orb */}
                <motion.div
                    className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
                    style={{
                        background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
                        top: purpleOrbTop,
                        left: purpleOrbLeft,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Blue gradient orb */}
                <motion.div
                    className="absolute w-[700px] h-[700px] rounded-full blur-[150px]"
                    style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
                        top: blueOrbTop,
                        right: blueOrbRight,
                    }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />

                {/* Pink gradient orb */}
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
                    style={{
                        background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)",
                        top: pinkOrbTop,
                        left: pinkOrbLeft,
                    }}
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4,
                    }}
                />
            </motion.div>

            {/* Subtle noise texture overlay */}
            <div
                className="fixed inset-0 -z-30 pointer-events-none opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </>
    );
}
