"use client";

import { motion } from "framer-motion";
import { InteractiveSlider } from "@/components/ui/InteractiveSlider";

export function ComparisonSlider() {
    // Using real AI-generated images
    const beforeImage = "/traditional-ledger.png";
    const afterImage = "/digital-kirata.png";


    return (
        <section className="relative py-32 bg-[#030014] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                        See the Transformation
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Drag the slider to compare traditional retail management with Kirata&apos;s modern approach
                    </p>
                </motion.div>

                {/* Comparison Slider */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <InteractiveSlider
                        beforeImage={beforeImage}
                        afterImage={afterImage}
                        beforeLabel="Traditional Method"
                        afterLabel="With Kirata"
                        className="aspect-video shadow-2xl"
                    />
                </motion.div>

                {/* Comparison Points */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                    >
                        <h3 className="text-xl font-bold text-red-400 mb-4">Traditional Method</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>Manual ledger books prone to errors</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>Time-consuming calculations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>No real-time inventory tracking</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>Difficult to track customer credit</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl"
                    >
                        <h3 className="text-xl font-bold text-green-400 mb-4">With Kirata</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>Digital records with zero errors</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>Automated calculations & reports</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>Live inventory updates</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✓</span>
                                <span>Smart credit management with reminders</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
