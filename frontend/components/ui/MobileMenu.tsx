"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Home, Sparkles, DollarSign, MessageCircle, HelpCircle, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { href: "#hero", label: "Home", icon: Home },
    { href: "#features", label: "Features", icon: Sparkles },
    { href: "#pricing", label: "Pricing", icon: DollarSign },
    { href: "#testimonials", label: "Testimonials", icon: MessageCircle },
    { href: "#faq", label: "FAQ", icon: HelpCircle },
    { href: "#newsletter", label: "Newsletter", icon: Newspaper },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const handleLinkClick = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#030014]/95 backdrop-blur-xl border-l border-white/10 z-50 shadow-2xl"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <span className="text-lg font-semibold text-white">Menu</span>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 overflow-y-auto py-6">
                                <ul className="space-y-2 px-4">
                                    {menuItems.map((item, index) => (
                                        <motion.li
                                            key={item.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <a
                                                href={item.href}
                                                onClick={handleLinkClick}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all group"
                                            >
                                                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span className="font-medium">{item.label}</span>
                                            </a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-white/10 space-y-3">
                                <Link href="/login" onClick={handleLinkClick}>
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={handleLinkClick}>
                                    <Button className="w-full bg-white text-black hover:bg-gray-200">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
