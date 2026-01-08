"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function AnimatedCounter({
    value,
    duration = 2000,
    decimals = 0,
    suffix = "",
    prefix = "",
    className = "",
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const hasAnimatedRef = useRef(false);

    const spring = useSpring(0, {
        mass: 0.8,
        stiffness: 75,
        damping: 15,
    });

    const display = useTransform(spring, (latest) => {
        return `${prefix}${latest.toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        if (inView && !hasAnimatedRef.current) {
            spring.set(value);
            hasAnimatedRef.current = true;
        }
    }, [inView, spring, value]);

    return (
        <span ref={ref} className={className}>
            <motion.span>{display}</motion.span>
        </span>
    );
}
