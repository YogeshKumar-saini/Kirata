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
            className="relative min-h-screen flex items-center justify-center bg-[#030014] pt-20 perspective-[1200px] overflow-hidden group"
        >
            {/* Premium Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#030014] via-[#0a0520] to-[#050318]" />
                
                {/* Hero Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/hero-bg-future.png"
                        alt="Retail Future Background"
                        fill
                        className="object-cover opacity-30 mix-blend-lighten"
                        priority
                        quality={95}
                    />
                </div>
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/50 via-transparent to-[#030014]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Particle Field */}
            <ParticleField particleCount={80} className="z-10" color="rgba(168, 85, 247, 0.5)" />

            {/* Advanced Gradient Mesh Background */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <motion.div
                    animate={{
                        x: [0, 120, 0],
                        y: [0, -80, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-purple-600/25 to-violet-600/25 blur-[140px]"
                />

                <motion.div
                    animate={{
                        x: [0, -120, 0],
                        y: [0, 120, 0],
                        scale: [1, 1.4, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    className="absolute -bottom-1/2 -right-1/4 w-[1100px] h-[1100px] rounded-full bg-gradient-to-l from-blue-600/25 to-cyan-600/25 blur-[140px]"
                />

                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-[130px]"
                />
                
                {/* Additional accent orbs */}
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-transparent blur-[100px]"
                />
            </div>

            {/* Premium Mouse Spotlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            800px circle at ${mouseX}px ${mouseY}px,
                            rgba(168, 85, 247, 0.15),
                            transparent 70%
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

                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 relative leading-[0.95]">
                    <motion.span
                        initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="block text-white mb-4 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                    >
                        Master Your
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 drop-shadow-[0_0_80px_rgba(168,85,247,0.4)]"
                        style={{
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
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
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-xl md:text-2xl text-gray-300/90 max-w-3xl mb-14 leading-relaxed font-light tracking-wide"
                >
                    The operating system for modern commerce. Seamlessly manage inventory, credit, and analytics with the power of AI.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row items-center gap-6 relative z-20"
                >
                    <Link href="/register">
                        <MagneticButton>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-500" />
                                <Button size="lg" className="h-16 px-12 rounded-full bg-white text-black hover:bg-gray-100 font-bold text-lg shadow-[0_0_50px_-12px_rgba(255,255,255,0.5)] hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.8)] transition-all duration-500 relative overflow-hidden">
                                    <motion.span
                                        className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-blue-400/30"
                                        animate={{ x: ["-200%", "200%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Start Free Trial
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
                                <Button variant="outline" size="lg" className="h-16 px-12 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-xl font-bold text-lg hover:border-white/40 transition-all duration-500 relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                                    <span className="relative z-10">View Demo</span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
