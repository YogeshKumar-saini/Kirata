"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement newsletter signup
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setEmail("");
        }, 3000);
    };

    return (
        <section className="relative py-24 bg-gradient-to-br from-[#030014] via-[#0a0520] to-[#030014] overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute right-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-900/10 blur-[100px]" />
            </div>

            <div className="mx-auto max-w-4xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-12 md:p-16 backdrop-blur-xl overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        {/* Icon */}
                        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
                            <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Stay Updated with Kirata
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                            Get the latest features, tips, and success stories delivered to your inbox. Join 10,000+ merchants.
                        </p>

                        {/* Form */}
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                                <div className="flex-1 relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full h-14 px-6 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-semibold shadow-lg transition-all hover:scale-105"
                                >
                                    Subscribe
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-3 text-green-400 text-lg font-semibold"
                            >
                                <Sparkles className="w-6 h-6" />
                                <span>Thanks for subscribing! Check your inbox.</span>
                            </motion.div>
                        )}

                        {/* Privacy note */}
                        <p className="text-xs text-gray-500 mt-6">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
