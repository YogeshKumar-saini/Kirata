"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Award, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParticleField } from "@/components/ui/ParticleField";

/* ---------------------------------------------
 * DATA
 * --------------------------------------------- */

const logos = [
    { name: "Startup India", url: "https://via.placeholder.com/120x40/6366f1/ffffff?text=Startup+India" },
    { name: "NASSCOM", url: "https://via.placeholder.com/120x40/8b5cf6/ffffff?text=NASSCOM" },
    { name: "Google for Startups", url: "https://via.placeholder.com/140x40/ec4899/ffffff?text=Google+Startups" },
    { name: "AWS Activate", url: "https://via.placeholder.com/120x40/3b82f6/ffffff?text=AWS+Activate" },
    { name: "Microsoft for Startups", url: "https://via.placeholder.com/160x40/6366f1/ffffff?text=Microsoft+Startups" },
    { name: "YourStory", url: "https://via.placeholder.com/120x40/8b5cf6/ffffff?text=YourStory" },
];

const metrics = [
    {
        icon: Users,
        value: "10,000+",
        label: "Active Merchants",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: TrendingUp,
        value: "₹500Cr+",
        label: "Transactions Processed",
        color: "from-blue-500 to-blue-600",
    },
    {
        icon: Award,
        value: "4.9/5",
        label: "Average Rating",
        color: "from-pink-500 to-pink-600",
    },
    {
        icon: Shield,
        value: "99.9%",
        label: "Uptime SLA",
        color: "from-indigo-500 to-indigo-600",
    },
];

/* ---------------------------------------------
 * COMPONENT
 * --------------------------------------------- */

export function SocialProof() {
    return (
        <section
            id="social-proof"
            className="relative overflow-hidden bg-gradient-to-b from-[#030014] via-[#08041d] to-[#030014] py-24"
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/8 via-purple-500/5 to-pink-500/8 blur-3xl" />

            {/* Particle Field */}
            <ParticleField particleCount={30} className="opacity-40" color="rgba(236, 72, 153, 0.3)" />

            {/* Animated gradient orbs */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[80px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3,
                    }}
                    className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[80px]"
                />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                {/* -----------------------------------------
         * TRUSTED BY
         * ----------------------------------------- */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-20"
                >
                    <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
                        Trusted by leading organizations
                    </p>

                    {/* Marquee */}
                    <div className="relative overflow-hidden">
                        <motion.div
                            className="flex w-max gap-10"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 30,
                            }}
                            whileHover={{ animationPlayState: "paused" }}
                            style={{ willChange: "transform" }}
                        >
                            {[...logos, ...logos].map((logo, i) => (
                                <motion.div
                                    key={i}
                                    className="
                    flex h-16 w-auto shrink-0 items-center justify-center
                    rounded-2xl border border-white/20
                    bg-gradient-to-br from-white/[0.12] to-white/[0.06]
                    px-8 backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/20
                    relative overflow-hidden group
                  "
                                    whileHover={{ y: -4 }}
                                >
                                    {/* Shimmer effect on hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <img
                                        src={logo.url}
                                        alt={logo.name}
                                        className="h-9 w-auto object-contain opacity-80 transition-opacity hover:opacity-100 relative z-10"
                                        loading="lazy"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Edge fades */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030014] to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030014] to-transparent" />
                    </div>
                </motion.div>

                {/* -----------------------------------------
         * METRICS
         * ----------------------------------------- */}
                <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
                    {metrics.map((metric, i) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.92 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="group relative"
                        >
                            {/* Animated gradient border */}
                            <motion.div
                                className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: `linear-gradient(90deg, ${metric.color.replace('from-', '').replace('to-', '').split(' ').map(c => `var(--tw-gradient-stops)`).join(', ')})`,
                                }}
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />

                            <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 text-center backdrop-blur-xl transition-all hover:scale-105 hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/20 min-h-[200px] flex flex-col justify-center items-center">
                                {/* Pulse effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl"
                                    style={{
                                        background: `radial-gradient(circle at center, ${metric.color.includes('purple') ? '#a855f7' : metric.color.includes('blue') ? '#3b82f6' : metric.color.includes('pink') ? '#ec4899' : '#6366f1'}15, transparent 70%)`,
                                    }}
                                    animate={{
                                        opacity: [0, 0.5, 0],
                                        scale: [0.8, 1.2, 0.8],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.3,
                                    }}
                                />

                                {/* Icon */}
                                <motion.div
                                    className={`mx-auto mb-5 h-14 w-14 rounded-xl bg-gradient-to-br ${metric.color} p-0.5`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#030014]">
                                        <metric.icon className="h-7 w-7 text-white" />
                                    </div>
                                </motion.div>

                                {/* Value */}
                                <h3 className="mb-2 text-3xl font-bold text-white md:text-3xl lg:text-4xl tabular-nums relative z-10">
                                    {metric.label === "Transactions Processed" ? (
                                        <AnimatedCounter value={500} prefix="₹" suffix="Cr+" />
                                    ) : metric.label === "Active Merchants" ? (
                                        <AnimatedCounter value={10000} suffix="+" />
                                    ) : metric.label === "Average Rating" ? (
                                        <AnimatedCounter value={4.9} decimals={1} suffix="/5" />
                                    ) : (
                                        <AnimatedCounter value={99.9} decimals={1} suffix="%" />
                                    )}
                                </h3>

                                {/* Label */}
                                <p className="text-sm font-medium uppercase tracking-wider text-gray-400 relative z-10">
                                    {metric.label}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
