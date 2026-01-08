"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumTilt } from "@/components/ui/PremiumTilt";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "forever",
        description: "Perfect for small shops getting started",
        icon: Sparkles,
        features: [
            "Up to 100 products",
            "Basic inventory tracking",
            "Customer ledger (up to 50)",
            "Mobile app access",
            "Email support",
            "Basic reports",
        ],
        cta: "Get Started",
        popular: false,
        gradient: "from-gray-500 to-gray-600",
    },
    {
        name: "Professional",
        price: "₹499",
        period: "/month",
        description: "For growing businesses that need more",
        icon: Zap,
        features: [
            "Unlimited products",
            "Advanced inventory management",
            "Unlimited customer ledger",
            "AI-powered insights",
            "Priority support",
            "Advanced analytics",
            "Multi-user access",
            "Automated reminders",
            "Export reports",
        ],
        cta: "Start Free Trial",
        popular: true,
        gradient: "from-purple-500 to-blue-500",
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "pricing",
        description: "For large operations with custom needs",
        icon: Crown,
        features: [
            "Everything in Professional",
            "Multi-location support",
            "Custom integrations",
            "Dedicated account manager",
            "24/7 phone support",
            "Custom training",
            "API access",
            "White-label options",
        ],
        cta: "Contact Sales",
        popular: false,
        gradient: "from-yellow-500 to-orange-500",
    },
];

export function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

    return (
        <section className="relative py-32 bg-[#030014] overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-transparent to-blue-900/5" />
                <div className="absolute left-1/4 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-purple-900/10 blur-[120px]" />
                <div className="absolute right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-[120px]" />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            Choose the plan that&apos;s right for your business
                        </p>

                        {/* Billing toggle */}
                        <div className="inline-flex items-center gap-3 p-1 rounded-full bg-white/5 border border-white/10">
                            <button
                                onClick={() => setBillingPeriod("monthly")}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === "monthly"
                                    ? "bg-white text-black"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod("yearly")}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === "yearly"
                                    ? "bg-white text-black"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Yearly
                                <span className="ml-2 text-xs text-green-500">Save 20%</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={plan.popular ? "md:-mt-4" : ""}
                        >
                            <PremiumTilt className="h-full">
                                <div
                                    className={`relative h-full rounded-3xl border ${plan.popular ? "border-purple-500/50 shadow-2xl shadow-purple-500/20" : "border-white/10"
                                        } bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl overflow-hidden group hover:border-white/20 transition-all ${plan.popular ? "scale-105" : ""
                                        }`}
                                >
                                    {/* Popular badge */}
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`mb-6 w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} p-0.5`}>
                                        <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                            <plan.icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>

                                    {/* Plan name */}
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                                    {/* Price */}
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-white">{plan.price}</span>
                                            <span className="text-gray-400">{plan.period}</span>
                                        </div>
                                        {billingPeriod === "yearly" && plan.price !== "Free" && plan.price !== "Custom" && (
                                            <p className="text-sm text-green-500 mt-2">
                                                ₹{Math.round(parseInt(plan.price.replace("₹", "")) * 12 * 0.8)} billed yearly
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <Link href="/register" className="block mb-8">
                                        <Button
                                            className={`w-full h-12 rounded-full font-semibold transition-all ${plan.popular
                                                ? "bg-white text-black hover:bg-gray-200"
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                                                }`}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        {plan.features.map((feature, j) => (
                                            <div key={j} className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} p-0.5 flex-shrink-0`}>
                                                    <div className="w-full h-full rounded-full bg-[#030014] flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                                <span className="text-gray-300 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Hover glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                </div>
                            </PremiumTilt>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ link */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <p className="text-gray-400">
                        Have questions?{" "}
                        <a href="#" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors">
                            View FAQ
                        </a>
                        {" "}or{" "}
                        <a href="#" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors">
                            Contact Sales
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
