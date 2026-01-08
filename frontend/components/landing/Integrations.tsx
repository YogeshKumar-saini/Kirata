"use client";

import { motion } from "framer-motion";

const integrations = [
    { name: "Razorpay", logo: "💳", category: "Payment" },
    { name: "Paytm", logo: "📱", category: "Payment" },
    { name: "PhonePe", logo: "📲", category: "Payment" },
    { name: "Google Pay", logo: "🔵", category: "Payment" },
    { name: "Tally", logo: "📊", category: "Accounting" },
    { name: "Zoho Books", logo: "📚", category: "Accounting" },
    { name: "WhatsApp", logo: "💬", category: "Communication" },
    { name: "SMS Gateway", logo: "📧", category: "Communication" },
    { name: "Google Analytics", logo: "📈", category: "Analytics" },
    { name: "GST Portal", logo: "🏛️", category: "Compliance" },
];

// Duplicate for infinite scroll effect
const allIntegrations = [...integrations, ...integrations];

export function Integrations() {
    return (
        <section className="relative py-32 bg-[#030014] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/5 to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                        Seamless Integrations
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Connect with the tools you already use. Kirata works with your favorite platforms.
                    </p>
                </motion.div>

                {/* Infinite Scroll Marquee */}
                <div className="relative">
                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030014] to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030014] to-transparent z-10" />

                    <div className="overflow-hidden">
                        <motion.div
                            animate={{
                                x: [0, -1000],
                            }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 30,
                                    ease: "linear",
                                },
                            }}
                            className="flex gap-6"
                        >
                            {allIntegrations.map((integration, index) => (
                                <div
                                    key={`${integration.name}-${index}`}
                                    className="flex-shrink-0 group"
                                >
                                    <div className="w-48 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105">
                                        <div className="text-4xl">{integration.logo}</div>
                                        <div className="text-center">
                                            <p className="font-semibold text-white text-sm">{integration.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{integration.category}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 flex flex-wrap justify-center gap-3"
                >
                    {["Payment", "Accounting", "Communication", "Analytics", "Compliance"].map((category) => (
                        <div
                            key={category}
                            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300"
                        >
                            {category}
                        </div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-gray-400">
                        Need a custom integration?{" "}
                        <a href="#newsletter" className="text-purple-400 hover:text-purple-300 underline">
                            Contact us
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
