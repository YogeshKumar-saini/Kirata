"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Home, Users, Zap, DollarSign, MessageSquare, Mail } from "lucide-react";

const sections = [
    { id: "hero", label: "Home", icon: Home },
    { id: "social-proof", label: "Trust", icon: Users },
    { id: "features", label: "Features", icon: Zap },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "faq", label: "FAQ", icon: MessageSquare },
    { id: "newsletter", label: "Newsletter", icon: Mail },
];

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <>
            {/* Progress bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Section navigation dots */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
                {sections.map((section, i) => (
                    <motion.button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {/* Dot */}
                        <div className="w-3 h-3 rounded-full bg-white/20 group-hover:bg-purple-500 transition-all duration-300 border border-white/30" />

                        {/* Tooltip */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 whitespace-nowrap">
                                <section.icon className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-white">{section.label}</span>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </>
    );
}
