"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Sparkles, Star, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
    const router = useRouter();
    const { user, loading, redirectBasedOnRole } = useAuth();
    const [timeLeft, setTimeLeft] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleRedirect = React.useCallback(() => {
        setIsRedirecting(true);
        if (user) {
            redirectBasedOnRole(user.role, user.hasCompletedShopSetup || (user.shops && user.shops.length > 0));
        } else {
            router.push('/login');
        }
    }, [user, redirectBasedOnRole, router]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, user, router]);

    useEffect(() => {
        if (timeLeft === 0 && !isRedirecting) {
            const timeoutId = setTimeout(() => {
                handleRedirect();
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [timeLeft, isRedirecting, handleRedirect]);



    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
            {/* Dynamic Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/30 blur-[150px] rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/30 blur-[150px] rounded-full"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative z-10 max-w-3xl w-full px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    {/* Floating Icon */}
                    <div className="flex justify-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-indigo-500 blur-2xl opacity-50 rounded-full" />
                            <div className="relative h-24 w-24 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Sparkles className="h-12 w-12 text-primary fill-primary/20" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Greeting Text */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                Welcome,
                            </span>{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
                                {user?.name?.split(' ')[0] || 'Guest'}
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-slate-400 max-w-2xl mx-auto"
                        >
                            We&apos;re setting up your premium workspace. Get ready for a seamless experience.
                        </motion.p>
                    </div>

                    {/* Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto py-8"
                    >
                        {[
                            { icon: Zap, label: "Lightning Fast" },
                            { icon: ShieldCheck, label: "Secure" },
                            { icon: Star, label: "Premium" },
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                <item.icon className="h-6 w-6 text-primary mb-2" />
                                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Progress Bar & Actions */}
                    <div className="space-y-6 max-w-md mx-auto">
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-gradient-to-r from-primary to-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Redirecting in {timeLeft}s...</span>
                            <Button
                                onClick={handleRedirect}
                                disabled={isRedirecting}
                                variant="ghost"
                                className="text-white hover:text-primary hover:bg-white/5 transition-colors group"
                            >
                                {isRedirecting ? 'Entering...' : 'Skip Animation'}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
