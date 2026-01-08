import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import { Spotlight } from '@/components/ui/Spotlight';

import { Bell, Mail, MessageSquare, Shield, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { NotificationPrefs } from '@/context/auth-context';

interface PreferencesCardProps {
    preferences: NotificationPrefs | undefined;
    onUpdate: (prefs: { notificationPrefs: NotificationPrefs }) => Promise<void>;
    variants: Variants;
}

export const PreferencesCard = ({ preferences, onUpdate, variants }: PreferencesCardProps) => {
    const [loading, setLoading] = useState(false);
    const [localPrefs, setLocalPrefs] = useState(preferences || {
        orderUpdates: { email: true, sms: true, whatsapp: true },
        promotionalOffers: { email: true, push: false },
        securityAlerts: { email: true, sms: true }
    });


    const handleToggle = (category: keyof NotificationPrefs, method: string) => {
        const currentCategory = localPrefs[category] || {};
        const newPrefs: NotificationPrefs = {
            ...localPrefs,
            [category]: {
                ...currentCategory,
                [method]: !(currentCategory as Record<string, boolean | undefined>)[method]
            }
        };
        setLocalPrefs(newPrefs);
        handleSave(newPrefs);
    };

    const handleSave = async (newPrefs: NotificationPrefs) => {
        setLoading(true);
        try {
            await onUpdate({ notificationPrefs: newPrefs });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumTilt className="lg:col-span-2 h-full">
            <motion.div variants={variants} className="h-full">
                <Spotlight className="h-full">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 dark:border-white/10 bg-card/50 dark:bg-white/5 backdrop-blur-xl p-8 h-full flex flex-col group hover:border-indigo-500/20 transition-all duration-500 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 transition-transform duration-300">
                                <Bell className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-2xl text-foreground dark:text-white">Notification Preferences</h2>
                                <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {/* Order Updates */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                    <h3 className="font-semibold text-foreground dark:text-white">Order Updates</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="order-email" className="text-sm text-foreground/80 dark:text-slate-300">Email</Label>
                                        </div>
                                        <Switch
                                            id="order-email"
                                            checked={localPrefs.orderUpdates?.email}
                                            onCheckedChange={() => handleToggle('orderUpdates', 'email')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="order-sms" className="text-sm text-foreground/80 dark:text-slate-300">SMS</Label>
                                        </div>
                                        <Switch
                                            id="order-sms"
                                            checked={localPrefs.orderUpdates?.sms}
                                            onCheckedChange={() => handleToggle('orderUpdates', 'sms')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-4 rounded bg-green-500/20 text-green-600 dark:text-green-500 flex items-center justify-center text-[10px] font-bold">W</div>
                                            <Label htmlFor="order-whatsapp" className="text-sm text-foreground/80 dark:text-slate-300">WhatsApp</Label>
                                        </div>
                                        <Switch
                                            id="order-whatsapp"
                                            checked={localPrefs.orderUpdates?.whatsapp}
                                            onCheckedChange={() => handleToggle('orderUpdates', 'whatsapp')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Alerts */}
                            <div className="space-y-4 pt-4 border-t border-border/50 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                                    <h3 className="font-semibold text-foreground dark:text-white">Security Alerts</h3>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="sec-email" className="text-sm text-foreground/80 dark:text-slate-300">Email</Label>
                                        </div>
                                        <Switch
                                            id="sec-email"
                                            checked={localPrefs.securityAlerts?.email}
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="sec-sms" className="text-sm text-foreground/80 dark:text-slate-300">SMS</Label>
                                        </div>
                                        <Switch
                                            id="sec-sms"
                                            checked={localPrefs.securityAlerts?.sms}
                                            onCheckedChange={() => handleToggle('securityAlerts', 'sms')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Spotlight>
            </motion.div>
        </PremiumTilt>
    );
};
