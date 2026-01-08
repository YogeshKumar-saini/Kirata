import React from 'react';
import { motion, Variants } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import { Spotlight } from '@/components/ui/Spotlight';

interface DangerZoneCardProps {
    onDeactivate: () => void;
    variants: Variants;
}

export const DangerZoneCard = ({ onDeactivate, variants }: DangerZoneCardProps) => {
    return (
        <PremiumTilt className="lg:col-span-3">
            <motion.div variants={variants}>
                <Spotlight>
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-red-200 dark:border-red-500/20 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-red-900/10 backdrop-blur-xl p-8 lg:col-span-3 group hover:border-red-300 dark:hover:border-red-500/40 transition-colors">
                        {/* Background Glow */}
                        <div className="absolute -left-10 -bottom-10 " />

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Danger Zone</h2>
                                </div>
                                <p className="text-muted-foreground dark:text-slate-400 max-w-2xl leading-relaxed">
                                    Deactivating your account will log you out and disable access. All your data will remain safe, and you can reactivate at any time by simply logging in again.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                className="rounded-xl px-8 h-12 bg-red-600/80 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
                                onClick={onDeactivate}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deactivate Account
                            </Button>
                        </div>
                    </div>
                </Spotlight>
            </motion.div>
        </PremiumTilt>
    );
};
