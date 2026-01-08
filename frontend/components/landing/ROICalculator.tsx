"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ROICalculator() {
    const [transactions, setTransactions] = useState(50);
    const [avgValue, setAvgValue] = useState(500);
    const [employees, setEmployees] = useState(2);

    // Calculations
    const monthlyTransactions = transactions * 30;
    const monthlyRevenue = monthlyTransactions * avgValue;
    const timeSavedPerTransaction = 3; // minutes
    const totalTimeSaved = (monthlyTransactions * timeSavedPerTransaction) / 60; // hours
    const errorReduction = 95; // percentage
    const revenueIncrease = monthlyRevenue * 0.15; // 15% increase
    const roiMonths = 2;

    return (
        <section className="relative py-32 bg-gradient-to-b from-[#030014] via-[#0a0520] to-[#030014] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                        <Calculator className="w-4 h-4" />
                        Calculate Your ROI
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                        See Your Potential Savings
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Discover how much time and money you can save with Kirata
                    </p>
                </motion.div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
                    {/* Left: Input Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <h3 className="text-2xl font-bold text-white mb-6">Your Business Metrics</h3>

                            {/* Daily Transactions */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Daily Transactions
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="500"
                                    value={transactions}
                                    onChange={(e) => setTransactions(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-400 text-sm">10</span>
                                    <span className="text-2xl font-bold text-white">{transactions}</span>
                                    <span className="text-gray-400 text-sm">500</span>
                                </div>
                            </div>

                            {/* Average Transaction Value */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Average Transaction Value (₹)
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="5000"
                                    step="100"
                                    value={avgValue}
                                    onChange={(e) => setAvgValue(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-400 text-sm">₹100</span>
                                    <span className="text-2xl font-bold text-white">₹{avgValue.toLocaleString()}</span>
                                    <span className="text-gray-400 text-sm">₹5,000</span>
                                </div>
                            </div>

                            {/* Number of Employees */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Number of Employees
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={employees}
                                    onChange={(e) => setEmployees(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-400 text-sm">1</span>
                                    <span className="text-2xl font-bold text-white">{employees}</span>
                                    <span className="text-gray-400 text-sm">20</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
                            <h3 className="text-2xl font-bold text-white mb-6">Your Potential Results</h3>

                            <div className="space-y-6">
                                {/* Time Saved */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Time Saved Per Month</p>
                                        <p className="text-3xl font-bold text-white">{Math.round(totalTimeSaved)} hours</p>
                                    </div>
                                </div>

                                {/* Revenue Increase */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Potential Revenue Increase</p>
                                        <p className="text-3xl font-bold text-white">₹{Math.round(revenueIncrease).toLocaleString()}/mo</p>
                                    </div>
                                </div>

                                {/* Error Reduction */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Error Reduction</p>
                                        <p className="text-3xl font-bold text-white">{errorReduction}%</p>
                                    </div>
                                </div>

                                {/* ROI Timeline */}
                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-gray-400 text-sm mb-2">Expected ROI Timeline</p>
                                    <p className="text-2xl font-bold text-green-400">{roiMonths} months</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full h-14 text-lg font-bold shadow-lg shadow-purple-500/30"
                            >
                                Start Saving Today
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
