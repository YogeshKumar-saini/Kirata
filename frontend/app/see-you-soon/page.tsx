"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoodbyePage() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleManualRedirect = () => {
        setIsRedirecting(true);
        router.push('/login');
    };

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            router.push('/login');
        }
    }, [timeLeft, router]);

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex items-center justify-center">
            {/* Dynamic Background Gradients - Cooler Tones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/20 blur-[150px] rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
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
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-500 blur-2xl opacity-50 rounded-full" />
                            <div className="relative h-24 w-24 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                                <LogOut className="h-10 w-10 text-cyan-400 fill-cyan-400/10 ml-2" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Goodbye Text */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                See you
                            </span>{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                                soon
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-slate-400 max-w-2xl mx-auto"
                        >
                            You&apos;ve been successfully logged out. Your session is secure.
                        </motion.p>
                    </div>

                    {/* Security Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto py-8"
                    >
                        {[
                            { icon: CheckCircle2, label: "Logged Out" },
                            { icon: ShieldCheck, label: "Session Cleared" },
                            { icon: UserCheck, label: "Data Secured" },
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                <item.icon className="h-6 w-6 text-cyan-400 mb-2" />
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
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Redirecting to login in {timeLeft}s...</span>
                            <Button
                                onClick={handleManualRedirect}
                                disabled={isRedirecting}
                                variant="ghost"
                                className="text-white hover:text-cyan-400 hover:bg-white/5 transition-colors group"
                            >
                                {isRedirecting ? 'Redirecting...' : 'Sign In Again'}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
