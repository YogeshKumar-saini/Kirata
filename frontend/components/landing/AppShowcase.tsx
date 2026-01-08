"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function AppShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const rotateX = useTransform(scrollYProgress, [0, 0.5], [15, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <section
            ref={containerRef}
            className="relative z-10 py-20 overflow-hidden bg-[#030014]"
        >
            <div className="container px-4 mx-auto perspective-[1200px]">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-6"
                    >
                        Powerful Interface, Simple Experience
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg text-gray-400"
                    >
                        Manage your entire shop from a single, intuitive dashboard designed for clarity and speed.
                    </motion.p>
                </div>

                <motion.div
                    style={{
                        rotateX,
                        scale,
                        opacity,
                    }}
                    className="relative mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl"
                >
                    <div className="rounded-xl overflow-hidden bg-black/50 border border-white/5 aspect-[16/10] relative">
                        {/* Placeholder for App Screenshot - In a real scenario, use actual screenshot */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                            <span className="text-gray-600 font-mono text-sm">[ Dashboard Mockup Visualization ]</span>
                            {/* 
                  To be realistic, we'd use a real screenshot here. 
                  For now we simulate it with a generic techy background or existing mockup 
                */}
                            <img
                                src="/analytics-mockup.png"
                                alt="Dashboard Interface"
                                className="w-full h-full object-cover opacity-80"
                            />
                        </div>

                        {/* Floating UI Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-10 w-64 p-4 rounded-xl bg-gray-900/90 border border-white/10 backdrop-blur-lg shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">$</div>
                                <div>
                                    <div className="text-xs text-gray-400">Total Revenue</div>
                                    <div className="text-lg font-bold text-white">₹45,231.00</div>
                                </div>
                            </div>
                            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[75%]" />
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-10 left-10 w-56 p-4 rounded-xl bg-gray-900/90 border border-white/10 backdrop-blur-lg shadow-xl"
                        >
                            <div className="text-sm font-medium text-gray-300 mb-2">Recent Orders</div>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                                        <div className="w-6 h-6 rounded bg-purple-500/20" />
                                        <div className="w-16 h-2 rounded bg-gray-700" />
                                        <div className="ml-auto w-8 h-2 rounded bg-gray-700" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
            </div>
        </section>
    );
}
