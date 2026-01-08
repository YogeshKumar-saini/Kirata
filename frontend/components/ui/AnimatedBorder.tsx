"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedBorderProps {
    children: ReactNode;
    className?: string;
    gradientColors?: string[];
    borderWidth?: number;
    animationDuration?: number;
}

export function AnimatedBorder({
    children,
    className = "",
    gradientColors = ["#a855f7", "#ec4899", "#3b82f6", "#a855f7"],
    borderWidth = 2,
    animationDuration = 3,
}: AnimatedBorderProps) {
    return (
        <div className={`relative ${className}`}>
            {/* Animated gradient border */}
            <motion.div
                className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    padding: `${borderWidth}px`,
                    background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
                    backgroundSize: "200% 200%",
                }}
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                    duration: animationDuration,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                <div className="w-full h-full rounded-[inherit] bg-[#030014]" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
