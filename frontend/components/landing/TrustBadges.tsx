"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Award, CheckCircle2, Zap, Globe } from "lucide-react";

const badges = [
    {
        icon: Shield,
        title: "Bank-Grade Security",
        description: "AES-256 Encryption",
        color: "from-blue-500 to-blue-600",
    },
    {
        icon: Lock,
        title: "GDPR Compliant",
        description: "Data Privacy Certified",
        color: "from-green-500 to-green-600",
    },
    {
        icon: Award,
        title: "ISO 27001",
        description: "Security Certified",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: CheckCircle2,
        title: "SOC 2 Type II",
        description: "Compliance Verified",
        color: "from-indigo-500 to-indigo-600",
    },
    {
        icon: Zap,
        title: "99.9% Uptime",
        description: "SLA Guaranteed",
        color: "from-yellow-500 to-orange-500",
    },
    {
        icon: Globe,
        title: "Global CDN",
        description: "Fast Worldwide",
        color: "from-cyan-500 to-blue-500",
    },
];

export function TrustBadges() {
    return (
        <section className="relative py-16 bg-[#030014] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-transparent to-blue-500/3" />

            <div className="mx-auto max-w-7xl px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Enterprise-Grade Security & Reliability
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Trusted by thousands of businesses worldwide
                        </p>
                    </motion.div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {badges.map((badge, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="group"
                        >
                            <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-sm hover:border-white/20 transition-all hover:scale-105 text-center">
                                {/* Icon */}
                                <div className={`mb-3 w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color} p-0.5 mx-auto`}>
                                    <div className="w-full h-full rounded-xl bg-[#030014] flex items-center justify-center">
                                        <badge.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h4 className="text-sm font-semibold text-white mb-1">
                                    {badge.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {badge.description}
                                </p>

                                {/* Hover glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
