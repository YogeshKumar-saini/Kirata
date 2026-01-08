"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Store, BarChart3, Rocket, CheckCircle2 } from "lucide-react";

const steps = [
    {
        icon: UserPlus,
        title: "Sign Up in Seconds",
        description: "Create your account with just your phone number. No complex forms, no hassle.",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: Store,
        title: "Set Up Your Shop",
        description: "Add your shop details, inventory, and customize your preferences in minutes.",
        color: "from-blue-500 to-blue-600",
    },
    {
        icon: BarChart3,
        title: "Start Managing",
        description: "Track sales, manage inventory, handle customer credit - all from one dashboard.",
        color: "from-pink-500 to-pink-600",
    },
    {
        icon: Rocket,
        title: "Grow Your Business",
        description: "Use AI-powered insights and analytics to make smarter decisions and increase profits.",
        color: "from-indigo-500 to-indigo-600",
    },
];

export function HowItWorks() {
    return (
        <section className="relative py-32 bg-gradient-to-br from-[#030014] via-[#0a0520] to-[#030014] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/5 via-transparent to-purple-900/5" />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mx-auto mb-20 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
                            Get Started in 4 Simple Steps
                        </h2>
                        <p className="text-lg text-gray-400">
                            From signup to success in less than 10 minutes
                        </p>
                    </motion.div>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Animated connecting line - desktop only */}
                    <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-20 -z-10 overflow-visible">
                        <svg className="w-full h-full" overflow="visible">
                            <motion.path
                                d="M0,20 Q300,60 600,20 T1200,20"
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                                    <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" />
                                    <stop offset="100%" stopColor="rgba(6, 182, 212, 0.4)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="relative"
                            >
                                {/* Step number indicator */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 + 0.3, type: "spring" }}
                                        className="w-12 h-12 rounded-full bg-[#030014] border-2 border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                    >
                                        <span className="text-lg font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                                            {i + 1}
                                        </span>
                                    </motion.div>
                                </div>

                                <div className="relative pt-12 h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 backdrop-blur-xl overflow-hidden group hover:border-white/20 transition-all hover:scale-105">
                                    {/* Icon */}
                                    <div className={`mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 mx-auto`}>
                                        <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                            <step.icon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-white mb-3 text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-center text-sm">
                                        {step.description}
                                    </p>

                                    {/* Checkmark for completed feel */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>

                                    {/* Hover glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-gray-400 text-lg">
                        Ready to transform your business?{" "}
                        <a href="/register" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors">
                            Get started for free
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
