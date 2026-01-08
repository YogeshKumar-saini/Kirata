import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Phone, Mail, CheckCircle2, Shield, Lock } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/context/auth-context';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import { Spotlight } from '@/components/ui/Spotlight';

interface SecurityCardProps {
    user: UserType | null;
    variants: Variants;
    onPhoneChange: () => void;
    onEmailChange: () => void;
    onVerifyEmail: () => void;
    onChangePassword: () => void;
    isVerifyingEmail: boolean;
}

export const SecurityCard = ({ user, variants, onPhoneChange, onEmailChange, onVerifyEmail, onChangePassword, isVerifyingEmail }: SecurityCardProps) => {
    return (
        <PremiumTilt className="lg:col-span-3">
            <motion.div variants={variants}>
                <Spotlight>
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/10 dark:border-white/10 bg-gradient-to-br from-card to-muted/20 dark:from-black/40 dark:to-black/20 backdrop-blur-xl p-8 group">
                        {/* Background Glow */}
                        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />

                        <div className="mb-8 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground dark:text-white">Security & Contact</h2>
                            </div>
                            <p className="text-sm text-slate-400 ml-[3.25rem]">Manage your verified contact methods and password.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 relative z-10">
                            {/* Phone Number */}
                            <div className="space-y-3 group/field">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <FloatingLabelInput
                                            id="phone"
                                            label="Phone Number"
                                            startIcon={<Phone className="h-4 w-4" />}
                                            value={user?.phone || ''}
                                            disabled
                                            className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 text-muted-foreground cursor-not-allowed"
                                            endIcon={user?.phone ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : undefined}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onPhoneChange}
                                        className="border-border/10 dark:border-white/10 hover:bg-muted/20 dark:hover:bg-white/10 h-14 px-4 rounded-xl transition-all"
                                    >
                                        Change
                                    </Button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-3 group/field">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <FloatingLabelInput
                                            id="email"
                                            label="Email Address"
                                            startIcon={<Mail className="h-4 w-4" />}
                                            value={user?.email || 'No email set'}
                                            disabled
                                            className="bg-black/20 border-white/10 text-slate-400 cursor-not-allowed"
                                            endIcon={user?.email ? (
                                                user.emailVerified ?
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                                                    <Shield className="h-4 w-4 text-yellow-500" />
                                            ) : undefined}
                                        />
                                    </div>
                                    {!user?.emailVerified && user?.email && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onVerifyEmail}
                                            loading={isVerifyingEmail}
                                            className="border-border/10 dark:border-white/10 hover:bg-muted/20 dark:hover:bg-white/10 h-14 px-4 rounded-xl transition-all text-yellow-600 dark:text-yellow-500"
                                        >
                                            Verify
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onEmailChange}
                                        className="border-border/10 dark:border-white/10 hover:bg-muted/20 dark:hover:bg-white/10 h-14 px-4 rounded-xl transition-all"
                                    >
                                        Change
                                    </Button>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3 md:col-span-2">
                                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                    Password Protection
                                </Label>
                                <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-muted/20 to-transparent dark:from-white/5 border border-border/5 dark:border-white/5 gap-4 group/pass hover:border-indigo-500/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground dark:text-white">Security Information</p>
                                        <p className="text-sm text-muted-foreground">
                                            Set a strong password to protect your account and login across devices.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onChangePassword}
                                        className="whitespace-nowrap bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20 text-foreground dark:text-white border-0 h-10 px-6 rounded-xl transition-all w-full sm:w-auto"
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Spotlight>
            </motion.div>
        </PremiumTilt>
    );
};
