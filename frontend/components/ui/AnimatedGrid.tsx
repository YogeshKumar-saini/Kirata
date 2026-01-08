"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedGrid() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Animated grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]">
                {/* Animated gradient overlay */}
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"
                    style={{
                        backgroundSize: "200% 200%",
                    }}
                />
            </div>

            {/* Radial gradient vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)]" />
        </div>
    );
}
