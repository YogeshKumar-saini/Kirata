"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import React, { useEffect, useRef, useId } from "react";
import { TrendingUp, Users, Star, Shield } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParticleField } from "@/components/ui/ParticleField";

const stats = [
    {
        value: 50,
        suffix: "M+",
        label: "Transactions Processed",
        icon: TrendingUp,
        color: ["#a855f7", "#9333ea"], // purple
        progress: 85,
    },
    {
        value: 10000,
        suffix: "+",
        label: "Active Merchants",
        icon: Users,
        color: ["#3b82f6", "#2563eb"], // blue
        progress: 92,
    },
    {
        value: 99.9,
        suffix: "%",
        label: "Uptime Guaranteed",
        decimals: 1,
        icon: Shield,
        color: ["#22c55e", "#16a34a"], // green
        progress: 99,
    },
    {
        value: 4.9,
        suffix: "/5",
        label: "User Satisfaction",
        decimals: 1,
        icon: Star,
        color: ["#facc15", "#f97316"], // yellow → orange
        progress: 98,
    },
];

function ProgressRing({
    progress,
    colors,
}: {
    progress: number;
    colors: string[];
}) {
    const ref = useRef<HTMLDivElement>(null);
    const gradientId = useId();
    const inView = useInView(ref, { once: true, margin: "-80px" });

    const spring = useSpring(0, {
        mass: 0.9,
        stiffness: 55,
        damping: 18,
    });

    useEffect(() => {
        if (inView) spring.set(progress);
    }, [inView, spring, progress]);

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const offset = useTransform(
        spring,
        (p) => circumference - (p / 100) * circumference
    );

    return (
        <div
            ref={ref}
            className="absolute inset-0 pointer-events-none"
            aria-hidden
        >
            <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 100 100"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="4"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset }}
                />
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

export function Stats() {
    return (
        <section
            id="stats"
            className="relative py-32 bg-gradient-to-b from-[#030014] via-[#0d0525] to-[#030014] overflow-hidden"
        >
            {/* Ambient gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/8 via-blue-500/5 to-purple-500/8 blur-3xl -z-10" />

            {/* Particle Field */}
            <ParticleField particleCount={40} className="opacity-50" color="rgba(59, 130, 246, 0.3)" />

            {/* Animated mesh background */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]"
                />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                            Trusted by Thousands
                        </h2>
                        <p className="text-gray-400 text-xl">
                            Join the fastest-growing retail platform in India
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.92 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: i * 0.08,
                                duration: 0.45,
                                ease: "easeOut",
                            }}
                            className="relative group"
                            style={{ willChange: "transform, opacity" }}
                        >
                            <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/15 backdrop-blur-xl transition-all hover:scale-[1.06] hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/20 min-h-[280px] flex flex-col items-center justify-center overflow-hidden transform-gpu">
                                {/* Enhanced glow on hover */}
                                <motion.div
                                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: `radial-gradient(circle at center, ${stat.color[0]}15, transparent 70%)`,
                                    }}
                                />

                                <ProgressRing
                                    progress={stat.progress}
                                    colors={stat.color}
                                />

                                <div
                                    className="mb-6 w-16 h-16 rounded-2xl p-[1px] relative z-10 group-hover:scale-110 transition-transform duration-300"
                                    style={{
                                        background: `linear-gradient(135deg, ${stat.color[0]}, ${stat.color[1]})`,
                                        boxShadow: `0 0 20px ${stat.color[0]}40`,
                                    }}
                                >
                                    <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                        <stat.icon
                                            className="w-8 h-8 text-white"
                                            aria-hidden
                                        />
                                    </div>
                                </div>

                                <h3 className="flex items-end justify-center gap-1 font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 mb-3 relative z-10">
                                    <span className="tabular-nums text-[2rem] sm:text-[2rem] md:text-[2rem] leading-none">
                                        <AnimatedCounter value={stat.value} decimals={stat.decimals} />
                                    </span>
                                    <span className="text-xl sm:text-xl md:text-xl leading-none opacity-80">
                                        {stat.suffix}
                                    </span>
                                </h3>

                            </div>
                            <p className="text-sm mt-2 md:text-sm font-medium text-gray-400 uppercase tracking-wider text-center relative z-10">
                                {stat.label}
                            </p>
                        </motion.div>

                    ))}
                </div>

            </div>
        </section>
    );
}
