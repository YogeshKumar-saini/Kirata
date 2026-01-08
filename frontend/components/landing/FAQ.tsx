"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "How does Kirata help my business?",
        answer: "Kirata provides a complete digital operating system for your shop. Track inventory in real-time, manage customer credit digitally, get AI-powered insights, and automate routine tasks. Most merchants see a 30% increase in efficiency within the first month.",
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use bank-grade encryption (AES-256) for all data. Your information is stored in secure data centers with 99.9% uptime. We're compliant with industry standards and never share your data with third parties.",
    },
    {
        question: "Can I try before I buy?",
        answer: "Yes! Our Starter plan is completely free forever with no credit card required. You can also start a 14-day free trial of our Professional plan to access all premium features.",
    },
    {
        question: "How long does setup take?",
        answer: "Most shops are up and running in under 10 minutes. Simply sign up, add your shop details, import your inventory (or add manually), and you're ready to go. We also provide video tutorials and live support to help you get started.",
    },
    {
        question: "Do you offer customer support?",
        answer: "Yes! Free users get email support with 24-hour response time. Professional plan users get priority support with 4-hour response time. Enterprise customers get dedicated account managers and 24/7 phone support.",
    },
    {
        question: "Can I export my data?",
        answer: "Absolutely. You own your data. Export reports, customer lists, inventory, and transaction history anytime in CSV, Excel, or PDF format. No lock-in, no hassle.",
    },
    {
        question: "What if I need help migrating from another system?",
        answer: "We offer free migration assistance for Professional and Enterprise plans. Our team will help you import your existing data, set up your workflows, and train your staff.",
    },
    {
        question: "Is there a mobile app?",
        answer: "Yes! Kirata is available on iOS and Android. Manage your shop on the go, receive notifications, and access all features from your mobile device.",
    },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="border-b border-white/10 last:border-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group hover:bg-white/5 px-6 -mx-6 rounded-xl transition-colors"
            >
                <span className="text-lg font-semibold text-white pr-8 group-hover:text-purple-300 transition-colors">
                    {faq.question}
                </span>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                    {isOpen ? (
                        <Minus className="w-5 h-5 text-purple-400" />
                    ) : (
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-400 leading-relaxed pb-6 px-6 -mx-6">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function FAQ() {
    return (
        <section className="relative py-32 bg-gradient-to-b from-[#030014] via-[#0a0520] to-[#030014] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/3 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-purple-900/10 blur-[120px]" />
                <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-indigo-900/8 blur-[100px]" />
            </div>

            <div className="mx-auto max-w-4xl px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-400">
                            Everything you need to know about Kirata
                        </p>
                    </motion.div>
                </div>

                {/* FAQ List */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 backdrop-blur-xl">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} faq={faq} index={i} />
                    ))}
                </div>

                {/* Still have questions? */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-400">
                        Still have questions?{" "}
                        <a
                            href="#"
                            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors"
                        >
                            Contact our support team
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
