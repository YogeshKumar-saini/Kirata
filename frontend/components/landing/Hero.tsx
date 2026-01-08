"use client";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { ParticleField } from "@/components/ui/ParticleField";
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useRef, MouseEvent } from "react";

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // Spotlight Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const taglines = [
        "Digital Shop",
        "Retail Future",
        "Smart Store",
        "Business OS"
    ];

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[110vh] flex items-center justify-center bg-gradient-to-b from-[#030014] via-[#0a0520] to-[#030014] pt-20 perspective-[1000px] overflow-hidden group"
        >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 select-none">
                <div className="absolute inset-0 bg-[#030014]">
                    <Image
                        src="/hero-bg-future.png"
                        alt="Retail Future Background"
                        fill
                        className="object-cover opacity-40 mix-blend-screen"
                        priority
                        quality={90}
                    />
                </div>
                {/* Dark overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#030014]/80 to-[#030014]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-[#030014]/40 to-[#030014]" />
            </div>

            {/* Particle Field */}
            <ParticleField particleCount={60} className="z-10" color="rgba(168, 85, 247, 0.4)" />

            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    className="absolute -bottom-1/2 -right-1/4 w-[900px] h-[900px] rounded-full bg-blue-600/20 blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-pink-600/15 blur-[120px]"
                />
            </div>

            {/* Mouse Spotlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 bg-[#030014] transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.1),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-8"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200 backdrop-blur-md shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105 cursor-default group relative overflow-hidden"
                        whileHover={{ y: -2 }}
                    >
                        {/* Animated background shimmer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse relative z-10" />
                        <span className="relative z-10">AI-Driven Retail Revolution</span>
                        <motion.span
                            className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30 relative z-10"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Zap className="w-3 h-3 inline mr-1" />
                            10,000+ Active Users
                        </motion.span>
                    </motion.div>
                </motion.div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 relative">
                    <motion.span
                        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="block text-white mb-2"
                    >
                        Master Your
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                    >
                        <TypewriterText
                            texts={taglines}
                            typingSpeed={150}
                            deletingSpeed={100}
                            pauseDuration={2000}
                        />
                    </motion.span>
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
                >
                    The operating system for modern commerce. Seamlessly manage inventory, credit, and analytics with the power of AI.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center gap-6"
                >
                    <Link href="/register">
                        <MagneticButton>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group"
                            >
                                <Button size="lg" className="h-16 px-10 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 relative overflow-hidden">
                                    <motion.span
                                        className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="relative z-10 flex items-center">
                                        Start Free Trial
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </span>
                                </Button>
                            </motion.div>
                        </MagneticButton>
                    </Link>
                    <Link href="/login">
                        <MagneticButton>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button variant="outline" size="lg" className="h-16 px-10 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md font-bold text-lg hover:border-white/30 transition-all relative overflow-hidden group">
                                    <span className="relative z-10">View Demo</span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </Button>
                            </motion.div>
                        </MagneticButton>
                    </Link>
                </motion.div>

                {/* 3D Floating Elements - Enhanced Glassmorphism */}
                <motion.div style={{ y: y1 }} className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-20 opacity-40 pointer-events-none hidden lg:block perspective-[1000px] z-0">
                    <div className="w-72 h-96 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-2xl p-6 rotate-y-12 rotate-z-6 shadow-[0_0_50px_-10px_rgba(100,0,255,0.1)]">
                        {/* Abstract UI Mockup */}
                        <div className="flex gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-white/20 shimmer relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                            <div className="space-y-2 w-full">
                                <div className="w-24 h-4 rounded bg-white/20" />
                                <div className="w-16 h-3 rounded bg-white/10" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-12 rounded-xl bg-white/5 border border-white/5" />)}
                        </div>
                    </div>
                </motion.div>

                <motion.div style={{ y: y2 }} className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-20 opacity-40 pointer-events-none hidden lg:block perspective-[1000px] z-0">
                    <div className="w-72 h-96 rounded-3xl bg-gradient-to-bl from-white/10 to-transparent border border-white/10 backdrop-blur-2xl p-6 -rotate-y-12 -rotate-z-6 shadow-[0_0_50px_-10px_rgba(0,100,255,0.1)]">
                        <div className="w-full h-40 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="space-y-3">
                            <div className="w-full h-4 rounded bg-white/10" />
                            <div className="w-3/4 h-4 rounded bg-white/10" />
                        </div>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.a
                    href="#social-proof"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                    <span className="text-sm font-medium">Scroll to Explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-6 h-6" />
                    </motion.div>
                </motion.a>

            </div>
        </section>
    );
}
