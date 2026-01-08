"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

export function ParallaxSection({
    children,
    speed = 0.5,
    className = "",
}: ParallaxSectionProps) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

    return (
        <motion.div style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}
