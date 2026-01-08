"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Star, CheckCircle2 } from "lucide-react";
import { PremiumTilt } from "@/components/ui/PremiumTilt";

const testimonials = [
    {
        name: "Rajesh Kumar",
        role: "Owner, Kumar General Store",
        location: "Mumbai, Maharashtra",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
        rating: 5,
        text: "Kirata transformed my business completely. The digital ledger feature alone saved me hours every week. My customers love the transparency, and I can finally track everything in one place.",
    },
    {
        name: "Priya Sharma",
        role: "Proprietor, Sharma Kirana",
        location: "Delhi",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        rating: 5,
        text: "The inventory management is a game-changer. I never run out of stock anymore, and the predictive alerts help me plan better. Revenue increased by 30% in just 3 months!",
    },
    {
        name: "Amit Patel",
        role: "Owner, Patel Provisions",
        location: "Ahmedabad, Gujarat",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
        rating: 5,
        text: "Best investment I made for my shop. The analytics dashboard shows me exactly what's working. Customer credit tracking is seamless, and payment reminders are automated.",
    },
    {
        name: "Sneha Reddy",
        role: "Manager, Reddy Supermart",
        location: "Hyderabad, Telangana",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        rating: 5,
        text: "Professional, reliable, and incredibly easy to use. My staff learned it in a day. The reports are so detailed that my accountant is impressed. Highly recommend!",
    },
];

export function Testimonials() {
    return (
        <section className="relative py-32 bg-gradient-to-b from-[#030014] via-[#050318] to-[#030014] overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute right-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-pink-900/10 blur-[120px]" />
                <div className="absolute left-1/3 bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-900/8 blur-[100px]" />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mx-auto mb-20 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
                            Loved by Shopkeepers Across India
                        </h2>
                        <p className="text-lg text-gray-400">
                            Join thousands of merchants who have transformed their businesses with Kirata
                        </p>
                    </motion.div>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                        >
                            <PremiumTilt className="h-full">
                                <div className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl overflow-hidden group hover:border-white/20 transition-colors">
                                    {/* Quote icon */}
                                    <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Quote className="w-16 h-16 text-purple-400" />
                                    </div>

                                    {/* Rating */}
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>

                                    {/* Testimonial text */}
                                    <p className="text-gray-300 leading-relaxed mb-8 relative z-10">
                                        &ldquo;{testimonial.text}&rdquo;
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-full h-full rounded-full bg-[#030014]"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/20 px-2 py-0.5 text-[0.6rem] font-medium text-blue-300 border border-blue-500/30">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    Verified
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{testimonial.role}</p>
                                            <p className="text-xs text-gray-500">{testimonial.location}</p>
                                        </div>
                                    </div>

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </PremiumTilt>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
