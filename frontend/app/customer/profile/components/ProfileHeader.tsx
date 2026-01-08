import React from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const ProfileHeader = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] p-8 sm:p-10 overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
                {/* Custom Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5">
                    <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                    <span className="text-white font-bold">Profile</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                        <Settings className="h-5 w-5 text-indigo-200" />
                    </div>
                    <span className="text-indigo-200 font-semibold tracking-wider text-sm uppercase">Account Management</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    Profile <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 animate-gradient-x">Settings</span>
                </h1>

                <p className="text-indigo-200/80 text-lg font-light max-w-2xl">
                    Manage your personal information, security preferences, and connected devices in one secure place.
                </p>
            </div>
        </motion.div>
    );
};
