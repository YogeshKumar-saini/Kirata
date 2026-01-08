"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    SiReact,
    SiNextdotjs,
    SiTypescript,
    SiTailwindcss,
    SiPostgresql,
    SiPrisma,
    SiDocker,
    SiVercel,
} from "react-icons/si";

const techStack = [
    {
        name: "Next.js",
        icon: SiNextdotjs,
        description: "React framework for production",
        color: "from-gray-700 to-black",
    },
    {
        name: "TypeScript",
        icon: SiTypescript,
        description: "Type-safe development",
        color: "from-blue-600 to-blue-700",
    },
    {
        name: "React",
        icon: SiReact,
        description: "UI component library",
        color: "from-cyan-500 to-blue-500",
    },
    {
        name: "Tailwind CSS",
        icon: SiTailwindcss,
        description: "Utility-first CSS",
        color: "from-cyan-400 to-blue-500",
    },
    {
        name: "PostgreSQL",
        icon: SiPostgresql,
        description: "Reliable database",
        color: "from-blue-600 to-blue-800",
    },
    {
        name: "Prisma",
        icon: SiPrisma,
        description: "Next-gen ORM",
        color: "from-indigo-600 to-purple-600",
    },
    {
        name: "Docker",
        icon: SiDocker,
        description: "Containerization",
        color: "from-blue-500 to-blue-600",
    },
    {
        name: "Vercel",
        icon: SiVercel,
        description: "Deployment platform",
        color: "from-gray-800 to-black",
    },
];

export function TechStack() {
    return (
        <section className="relative py-32 bg-gradient-to-b from-[#030014] via-[#050318] to-[#030014] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute right-1/3 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-cyan-900/10 blur-[120px]" />
                <div className="absolute left-1/4 bottom-1/3 h-[600px] w-[600px] rounded-full bg-indigo-900/8 blur-[110px]" />
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
                            Built with Modern Technology
                        </h2>
                        <p className="text-lg text-gray-400">
                            Powered by industry-leading tools and frameworks for maximum performance and reliability
                        </p>
                    </motion.div>
                </div>

                {/* Tech grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {techStack.map((tech, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="group relative"
                        >
                            <div className="relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all hover:scale-105">
                                {/* Icon */}
                                <div className={`mb-4 w-16 h-16 rounded-xl bg-gradient-to-br ${tech.color} p-0.5 mx-auto`}>
                                    <div className="w-full h-full rounded-xl bg-[#030014] flex items-center justify-center">
                                        <tech.icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                {/* Name */}
                                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                                    {tech.name}
                                </h3>
                                <p className="text-xs text-gray-400 text-center">
                                    {tech.description}
                                </p>

                                {/* Hover glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-gray-300">
                            All systems operational • 99.9% uptime
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
