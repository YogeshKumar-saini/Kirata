"use client";

import React, { useRef } from "react";
import { motion, useSpring, useMotionTemplate } from "framer-motion";

export function Spotlight({
    className = "",
    size = 400,
    children,
}: {
    className?: string;
    size?: number;
    children?: React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const mouseX = useSpring(0, { bounce: 0 });
    const mouseY = useSpring(0, { bounce: 0 });

    function handleMouseMove({
        currentTarget,
        clientX,
        clientY,
    }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden group ${className}`}
            onMouseMove={handleMouseMove}
        >
            {children}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              ${size}px circle at ${mouseX}px ${mouseY}px,
              rgba(124, 58, 237, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            {/* Border Highlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              ${size}px circle at ${mouseX}px ${mouseY}px,
              rgba(124, 58, 237, 0.5),
              transparent 80%
            )
          `,
                }}
            />
        </div>
    );
}
