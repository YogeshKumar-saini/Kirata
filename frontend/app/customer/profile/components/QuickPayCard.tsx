import React from 'react';
import { motion, Variants } from 'framer-motion';
import { QrCode, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import { Spotlight } from '@/components/ui/Spotlight';

interface QuickPayCardProps {
    userId?: string;
    variants: Variants;
}

export const QuickPayCard = ({ userId, variants }: QuickPayCardProps) => {
    return (
        <PremiumTilt className="lg:col-span-1 h-full">
            <motion.div variants={variants} className="h-full">
                <Spotlight className="h-full">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-indigo-500/20 dark:border-white/10 bg-gradient-to-br from-indigo-600/90 to-purple-700/90 dark:from-indigo-900/40 dark:to-purple-900/40 backdrop-blur-xl p-8 h-full flex flex-col items-center text-center shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 group">
                        {/* Background Glow */}
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-[80px] pointer-events-none group-hover:bg-indigo-400/40 transition-colors duration-500" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

                        <div className="relative space-y-8 w-full z-10">
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-lg transition-transform duration-300">
                                    <QrCode className="h-6 w-6 text-indigo-300" />
                                </div>
                                <h2 className="font-bold text-2xl text-white">Quick Pay</h2>
                            </div>

                            <div className="relative group/qr p-1 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mx-auto w-fit shadow-2xl shadow-indigo-500/20">
                                <div className="absolute inset-0 bg-white/50 blur-xl opacity-0 group-hover/qr:opacity-50 transition-opacity duration-500" />
                                <div className="relative flex flex-col items-center justify-center p-6 rounded-[1.8rem] bg-white w-full aspect-square max-w-[220px]">
                                    <QRCodeSVG
                                        value={userId ? `CUSTOMER:${userId}` : ''}
                                        className="w-full h-full"
                                        level="H"

                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 dark:bg-black/30 border border-white/10 backdrop-blur-md">
                                    <Sparkles className="h-3 w-3 text-indigo-400" />
                                    <p className="text-xs font-mono text-indigo-200">
                                        {userId?.substring(0, 12)}...
                                    </p>
                                </div>
                                <p className="text-sm text-indigo-100 dark:text-slate-300 font-medium max-w-[200px] mx-auto leading-relaxed">
                                    Show this QR code at any Kirata partner shop for instant checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </Spotlight>
            </motion.div>
        </PremiumTilt>
    );
};
