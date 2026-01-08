"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    Package,
    Users,
    CreditCard,
    BarChart3,
    ShieldCheck,
} from "lucide-react";
import { Spotlight } from "@/components/ui/Spotlight";
import { PremiumTilt } from "@/components/ui/PremiumTilt";

const features = [
    {
        title: "Smart Inventory",
        description:
            "Real-time stock tracking with predictive low-stock alerts and reorder intelligence.",
        icon: Package,
        span: "col-span-12 md:col-span-6 lg:col-span-4",
    },
    {
        title: "Customer Intelligence",
        description:
            "Understand buying behavior, retention, and lifetime value with clarity.",
        icon: Users,
        span: "col-span-12 md:col-span-6 lg:col-span-4",
    },
    {
        title: "Digital Udhaar",
        description:
            "Track customer credit digitally with reminders, history, and reconciliation.",
        icon: CreditCard,
        span: "col-span-12 md:col-span-12 lg:col-span-4",
    },
    {
        title: "Instant Reports",
        description:
            "Sales, profit, and tax reports generated instantly — export anytime.",
        icon: BarChart3,
        span: "col-span-12 md:col-span-8",
    },
    {
        title: "Security & Reliability",
        description:
            "End-to-end encryption with enterprise-grade uptime guarantees.",
        icon: ShieldCheck,
        span: "col-span-12 md:col-span-4",
    },
];


/* ================= MAIN SECTION ================= */

export function Features() {
    return (
        <section id="features" className="relative py-32 bg-[#030014] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 text-center"
                >
                    <h2 className="mb-6 text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        Built for Serious Growth
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-400 leading-relaxed">
                        Every feature is engineered to remove friction, save time, and scale confidently.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-12 gap-6 max-w-7xl mx-auto"
                >
                    {features.map((f, i) => (
                        <div key={i} className={f.span}>
                            <PremiumTilt className="h-full">
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 10
                                            }
                                        }
                                    }}
                                    className="h-full"
                                >
                                    <Spotlight className="relative h-full rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.12] to-white/[0.04] overflow-hidden group backdrop-blur-xl hover:border-white/30 transition-all">
                                        {/* Icon */}
                                        <div className="p-8 md:p-10">
                                            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                                    <f.icon className="w-8 h-8 text-white" />
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="mb-4 text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                                {f.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-base text-gray-300 leading-relaxed group-hover:text-white/90 transition-colors">
                                                {f.description}
                                            </p>
                                        </div>

                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </Spotlight>
                                </motion.div>
                            </PremiumTilt>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
