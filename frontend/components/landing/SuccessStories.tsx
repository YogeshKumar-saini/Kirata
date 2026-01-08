"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Users } from "lucide-react";

const successStories = [
    {
        name: "Rajesh Kumar",
        business: "Kumar General Store",
        location: "Mumbai, Maharashtra",
        image: "👨‍💼",
        challenge: "Managing credit for 200+ customers manually in ledger books",
        solution: "Switched to Kirata's digital credit tracking system",
        results: {
            revenue: "+35%",
            timeSaved: "15 hrs/week",
            errorReduction: "98%",
        },
        quote: "Kirata transformed how I manage my store. No more lost credit records!",
    },
    {
        name: "Priya Sharma",
        business: "Sharma Kirana Store",
        location: "Delhi, NCR",
        image: "👩‍💼",
        challenge: "Difficulty tracking inventory and frequent stockouts",
        solution: "Implemented Kirata's smart inventory management",
        results: {
            revenue: "+28%",
            timeSaved: "12 hrs/week",
            errorReduction: "95%",
        },
        quote: "Real-time stock alerts helped me never run out of popular items again.",
    },
    {
        name: "Amit Patel",
        business: "Patel Provision Store",
        location: "Ahmedabad, Gujarat",
        image: "👨‍💼",
        challenge: "Manual billing taking too much time during peak hours",
        solution: "Adopted Kirata's quick billing and mobile app",
        results: {
            revenue: "+42%",
            timeSaved: "20 hrs/week",
            errorReduction: "99%",
        },
        quote: "Billing is now 5x faster. My customers love the quick service!",
    },
];

export function SuccessStories() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % successStories.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % successStories.length);
    };

    const currentStory = successStories[currentIndex];

    return (
        <section className="relative py-32 bg-gradient-to-b from-[#030014] via-[#0a0520] to-[#030014] overflow-hidden">
            {/* Background */}
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
                        Success Stories
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Real businesses, real results. See how Kirata helped shop owners transform their operations.
                    </p>
                </motion.div>

                {/* Carousel */}
                <div className="max-w-5xl mx-auto">
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                                className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl"
                            >
                                <div className="grid md:grid-cols-3 gap-8">
                                    {/* Left: Customer Info */}
                                    <div className="md:col-span-1 text-center md:text-left">
                                        <div className="text-6xl mb-4">{currentStory.image}</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{currentStory.name}</h3>
                                        <p className="text-purple-400 font-medium mb-1">{currentStory.business}</p>
                                        <p className="text-gray-400 text-sm">{currentStory.location}</p>
                                    </div>

                                    {/* Right: Story Details */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Challenge & Solution */}
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Challenge</p>
                                            <p className="text-white mb-3">{currentStory.challenge}</p>
                                            <p className="text-sm text-gray-400 mb-1">Solution</p>
                                            <p className="text-white">{currentStory.solution}</p>
                                        </div>

                                        {/* Results */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                                                <p className="text-2xl font-bold text-white">{currentStory.results.revenue}</p>
                                                <p className="text-xs text-gray-400">Revenue</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <Clock className="w-5 h-5 text-blue-400 mb-2" />
                                                <p className="text-2xl font-bold text-white">{currentStory.results.timeSaved}</p>
                                                <p className="text-xs text-gray-400">Time Saved</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <Users className="w-5 h-5 text-purple-400 mb-2" />
                                                <p className="text-2xl font-bold text-white">{currentStory.results.errorReduction}</p>
                                                <p className="text-xs text-gray-400">Accuracy</p>
                                            </div>
                                        </div>

                                        {/* Quote */}
                                        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300">
                                            &ldquo;{currentStory.quote}&rdquo;
                                        </blockquote>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all"
                            aria-label="Previous story"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 transition-all"
                            aria-label="Next story"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {successStories.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsAutoPlaying(false);
                                }}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? "w-8 bg-white"
                                    : "w-2 bg-white/30 hover:bg-white/50"
                                    }`}
                                aria-label={`Go to story ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
