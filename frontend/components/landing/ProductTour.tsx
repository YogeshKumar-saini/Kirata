"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, CreditCard, BarChart3, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tourSteps = [
    {
        id: "inventory",
        title: "Smart Inventory Management",
        description: "Track stock in real-time with predictive alerts. Never run out of popular items or overstock slow movers.",
        icon: Package,
        features: [
            "Real-time stock tracking",
            "Low stock alerts",
            "Barcode scanning",
            "Batch management",
        ],
        color: "from-purple-500 to-blue-500",
    },
    {
        id: "credit",
        title: "Digital Udhaar System",
        description: "Manage customer credit digitally with automatic reminders and complete transaction history.",
        icon: CreditCard,
        features: [
            "Digital credit ledger",
            "Automated reminders",
            "Payment tracking",
            "Credit limits",
        ],
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: "analytics",
        title: "Powerful Analytics",
        description: "Get instant insights into sales, profits, and trends. Make data-driven decisions with confidence.",
        icon: BarChart3,
        features: [
            "Sales reports",
            "Profit analysis",
            "Customer insights",
            "Tax calculations",
        ],
        color: "from-cyan-500 to-green-500",
    },
    {
        id: "mobile",
        title: "Mobile-First Experience",
        description: "Manage your shop from anywhere. Full-featured mobile app for iOS and Android.",
        icon: Smartphone,
        features: [
            "iOS & Android apps",
            "Offline mode",
            "Quick billing",
            "Push notifications",
        ],
        color: "from-green-500 to-purple-500",
    },
];

export function ProductTour() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className="relative py-32 bg-gradient-to-b from-[#030014] via-[#0a0520] to-[#030014] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                        Take a Product Tour
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Discover how Kirata transforms your retail operations with powerful, easy-to-use features
                    </p>
                </motion.div>

                <div className="max-w-6xl mx-auto">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {tourSteps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(index)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${activeStep === index
                                    ? "bg-white text-black shadow-lg shadow-white/20"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                                    }`}
                            >
                                <step.icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{step.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid md:grid-cols-2 gap-12 items-center"
                        >
                            {/* Left: Details */}
                            <div className="space-y-6">
                                <div
                                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${tourSteps[activeStep].color} p-0.5`}
                                >
                                    <div className="w-full h-full rounded-2xl bg-[#030014] flex items-center justify-center">
                                        {(() => {
                                            const Icon = tourSteps[activeStep].icon;
                                            return <Icon className="w-8 h-8 text-white" />;
                                        })()}
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold text-white">
                                    {tourSteps[activeStep].title}
                                </h3>

                                <p className="text-lg text-gray-300 leading-relaxed">
                                    {tourSteps[activeStep].description}
                                </p>

                                <ul className="space-y-3">
                                    {tourSteps[activeStep].features.map((feature, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-3 text-gray-300"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tourSteps[activeStep].color}`} />
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>

                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="mt-4 bg-white text-black hover:bg-gray-200 rounded-full px-8"
                                    >
                                        Try It Now
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Right: Visual Mockup */}
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className={`relative rounded-3xl bg-gradient-to-br ${tourSteps[activeStep].color} p-[2px] shadow-2xl`}
                                >
                                    <div className="rounded-3xl bg-[#030014] overflow-hidden min-h-[400px] flex items-center justify-center">
                                        {/* Display actual mockup images */}
                                        {activeStep === 0 && (
                                            <img
                                                src="/inventory-mockup.png"
                                                alt="Inventory Management Dashboard"
                                                className="w-full h-full object-contain p-4"
                                            />
                                        )}
                                        {activeStep === 1 && (
                                            <img
                                                src="/credit-mockup.png"
                                                alt="Digital Credit Tracking"
                                                className="w-full h-full object-contain p-4"
                                            />
                                        )}
                                        {activeStep === 2 && (
                                            <img
                                                src="/analytics-mockup.png"
                                                alt="Analytics Dashboard"
                                                className="w-full h-full object-contain p-4"
                                            />
                                        )}
                                        {activeStep === 3 && (
                                            <img
                                                src="/mobile-mockup.png"
                                                alt="Mobile App Interface"
                                                className="w-full h-full object-contain p-4"
                                            />
                                        )}
                                    </div>
                                </motion.div>

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-xl"
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mt-12">
                        {tourSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveStep(index)}
                                className={`h-1.5 rounded-full transition-all ${activeStep === index
                                    ? "w-12 bg-white"
                                    : "w-1.5 bg-white/30 hover:bg-white/50"
                                    }`}
                                aria-label={`Go to step ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
