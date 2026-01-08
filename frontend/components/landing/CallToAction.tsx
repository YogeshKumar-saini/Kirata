"use client";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";

function ShootingStar({ delay }: { delay: number }) {
    const [repeatDelay, setRepeatDelay] = React.useState(2);

    React.useEffect(() => {
        setRepeatDelay(Math.random() * 5 + 2);
    }, []);

    return (
        <motion.div
            initial={{ left: "-10%", top: "40%", opacity: 0 }}
            animate={{
                left: ["-10%", "120%"],
                top: ["40%", "60%"],
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                duration: 3,
                delay: delay,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: repeatDelay
            }}
            className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-[15deg] blur-[1px] pointer-events-none z-0"
        />
    );
}

function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else {
                    // Reset to 24 hours
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }

                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center justify-center gap-4 mb-8">
            <Clock className="w-5 h-5 text-purple-400" />
            <div className="flex gap-3">
                {[
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-2xl font-bold text-white tabular-nums">
                                {String(item.value).padStart(2, "0")}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CallToAction() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <section ref={ref} className="py-24 relative overflow-hidden flex items-center justify-center min-h-[70vh]">
            {/* Shooting Stars */}
            <ShootingStar delay={0} />
            <ShootingStar delay={2} />
            <ShootingStar delay={4.5} />

            <div className="container relative z-10 px-4 md:px-6">
                <motion.div
                    style={{ y }}
                    className="max-w-5xl mx-auto rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/5 to-black/40 p-12 md:p-24 text-center overflow-hidden relative group backdrop-blur-3xl shadow-2xl"
                >
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 p-12 opacity-50 group-hover:rotate-12 transition-transform duration-700">
                        <Star className="w-24 h-24 text-yellow-500/20 fill-yellow-500/10" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-12 opacity-50 group-hover:-rotate-12 transition-transform duration-700">
                        <Star className="w-16 h-16 text-purple-500/20 fill-purple-500/10" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        {/* Limited time badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
                            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="text-sm font-semibold text-purple-300">
                                Limited Time Offer
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-white">
                            Ready to modernize your shop?
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of shopkeepers who are saving time and increasing profits with Kirata&apos;s intelligent operating system.
                        </p>

                        {/* Countdown Timer */}
                        <CountdownTimer />

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/register">
                                <MagneticButton>
                                    <Button size="lg" className="h-16 px-10 rounded-full text-lg bg-white text-black hover:bg-gray-100 hover:text-black shadow-2xl shadow-blue-500/20 transition-all duration-300 font-bold">
                                        Get Started For Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </MagneticButton>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm font-semibold">
                                    View Demo
                                </Button>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
