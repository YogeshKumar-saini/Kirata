"use client";

import React from "react";
import { motion, useMotionValue } from "framer-motion";

export function PremiumTilt({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);



    function onMove(e: React.MouseEvent<HTMLDivElement>) {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
    }

    return (
        <motion.div
            onMouseMove={onMove}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
            style={{ transformStyle: "preserve-3d" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
