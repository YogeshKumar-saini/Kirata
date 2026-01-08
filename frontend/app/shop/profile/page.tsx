"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth, Session } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Mail, MapPin, Phone, Shield, AlertTriangle, Monitor, Smartphone, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function ShopkeeperProfilePage() {
    const { user, updateProfile, sendEmailVerification, verifyEmail, requestEmailChange, confirmEmailChange, requestPhoneChange, confirmPhoneChange, listSessions, revokeSession, revokeAllSessions, deactivateAccount, setTransactionPin, updatePassword, requestPasswordReset, confirmPasswordReset } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        addressLine1: user?.addressLine1 || '',
        addressLine2: user?.addressLine2 || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
        address: user?.address || '' // Keep legacy
    });
    const [saving, setSaving] = useState(false);

    // Email Verification
    const [showVerifyEmailDialog, setShowVerifyEmailDialog] = useState(false);
    const [verifyEmailOtp, setVerifyEmailOtp] = useState('');
    const [verifyingEmail, setVerifyingEmail] = useState(false);

    // Change Email
    const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
    const [changeEmailStep, setChangeEmailStep] = useState<'input' | 'verify'>('input');
    const [newEmail, setNewEmail] = useState('');
    const [changeEmailOtp, setChangeEmailOtp] = useState('');
    const [changingEmail, setChangingEmail] = useState(false);

    // Change Phone
    const [showChangePhoneDialog, setShowChangePhoneDialog] = useState(false);
    const [changePhoneStep, setChangePhoneStep] = useState<'input' | 'verify'>('input');
    const [newPhone, setNewPhone] = useState('');
    const [changePhoneOtp, setChangePhoneOtp] = useState('');
    const [changingPhone, setChangingPhone] = useState(false);

    // Transaction PIN
    const [showPinDialog, setShowPinDialog] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [settingPin, setSettingPin] = useState(false);

    // Password Update
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Forgot Password Flow
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
    const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
    const [resetOtp, setResetOtp] = useState('');
    const [sendingReset, setSendingReset] = useState(false);
    const [resetMethod, setResetMethod] = useState<'phone' | 'email'>('phone');

    // Sessions
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Deactivate Account
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

    const loadSessions = useCallback(async () => {
        setLoadingSessions(true);
        try {
            const sessionList = await listSessions();
            // Handle different response formats
            const sessionsArray = Array.isArray(sessionList) ? sessionList : ((sessionList as { sessions: Session[] })?.sessions || []);
            setSessions(sessionsArray);
        } catch (err) {
            console.error('Failed to load sessions', err);
            setSessions([]); // Set empty array on error
        } finally {
            setLoadingSessions(false);
        }
    }, [listSessions]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(formData);
            toast({
                title: "Profile Updated",
                description: "Your details have been saved successfully.",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    // Email Verification Handlers
    const handleSendVerificationEmail = async () => {
        setVerifyingEmail(true);
        try {
            await sendEmailVerification();
            setShowVerifyEmailDialog(true);
            toast({
                title: "Verification Code Sent",
                description: "Check your email for the verification code.",
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to send verification code.",
                variant: "destructive"
            });
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleVerifyEmail = async () => {
        setVerifyingEmail(true);
        try {
            await verifyEmail(verifyEmailOtp);
            setShowVerifyEmailDialog(false);
            setVerifyEmailOtp('');
            toast({
                title: "Email Verified",
                description: "Your email has been successfully verified.",
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to verify email.",
                variant: "destructive"
            });
        } finally {
            setVerifyingEmail(false);
        }
    };

    // Change Email Handlers
    const handleRequestEmailChange = async () => {
        setChangingEmail(true);
        try {
            await requestEmailChange(newEmail);
            setChangeEmailStep('verify');
            toast({
                title: "Verification Code Sent",
                description: `A code has been sent to ${newEmail}`,
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to send verification code.",
                variant: "destructive"
            });
        } finally {
            setChangingEmail(false);
        }
    };

    const handleConfirmEmailChange = async () => {
        setChangingEmail(true);
        try {
            await confirmEmailChange(newEmail, changeEmailOtp);
            setShowChangeEmailDialog(false);
            setChangeEmailStep('input');
            setNewEmail('');
            setChangeEmailOtp('');
            toast({
                title: "Email Changed",
                description: "Your email has been successfully updated.",
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to change email.",
                variant: "destructive"
            });
        } finally {
            setChangingEmail(false);
        }
    };

    // Change Phone Handlers
    const handleRequestPhoneChange = async () => {
        setChangingPhone(true);
        try {
            await requestPhoneChange(newPhone);
            setChangePhoneStep('verify');
            toast({
                title: "Verification Code Sent",
                description: `A code has been sent to ${newPhone}`,
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to send verification code.",
                variant: "destructive"
            });
        } finally {
            setChangingPhone(false);
        }
    };

    const handleConfirmPhoneChange = async () => {
        setChangingPhone(true);
        try {
            await confirmPhoneChange(newPhone, changePhoneOtp);
            setShowChangePhoneDialog(false);
            setChangePhoneStep('input');
            setNewPhone('');
            setChangePhoneOtp('');
            toast({
                title: "Phone Changed",
                description: "Your phone number has been successfully updated.",
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to change phone.",
                variant: "destructive"
            });
        } finally {
            setChangingPhone(false);
        }
    };

    // Password Handler
    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive"
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters.",
                variant: "destructive"
            });
            return;
        }

        if (isForgotPasswordMode) {
            if (resetStep === 'request') {
                setSendingReset(true);
                try {
                    const payload = resetMethod === 'phone' ? { phone: user?.phone } : { email: user?.email };
                    await requestPasswordReset(payload);
                    setResetStep('verify');
                    toast({
                        title: "OTP Sent",
                        description: `OTP sent to your ${resetMethod === 'phone' ? 'phone' : 'email'}.`,
                    });
                } catch (err) {
                    toast({
                        title: "Error",
                        description: "Failed to send OTP.",
                        variant: "destructive"
                    });
                } finally {
                    setSendingReset(false);
                }
            } else {
                setUpdatingPassword(true);
                try {
                    const payload = resetMethod === 'phone' ? { phone: user?.phone } : { email: user?.email };
                    await confirmPasswordReset(payload, resetOtp, newPassword);
                    setShowPasswordDialog(false);
                    setIsForgotPasswordMode(false);
                    setResetStep('request');
                    setResetOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    toast({
                        title: "Password Reset",
                        description: "Your password has been reset successfully.",
                    });
                } catch (err) {
                    toast({
                        title: "Error",
                        description: "Failed to reset password. Invalid OTP?",
                        variant: "destructive"
                    });
                } finally {
                    setUpdatingPassword(false);
                }
            }
            return;
        }

        setUpdatingPassword(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            setShowPasswordDialog(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to update password.",
                variant: "destructive"
            });
        } finally {
            setUpdatingPassword(false);
        }
    };

    // Transaction PIN Handlers
    const handleSetPin = async () => {
        if (pin !== confirmPin) {
            toast({
                title: "Error",
                description: "PINs do not match.",
                variant: "destructive"
            });
            return;
        }

        if (pin.length < 4 || pin.length > 6) {
            toast({
                title: "Error",
                description: "PIN must be 4-6 digits.",
                variant: "destructive"
            });
            return;
        }

        setSettingPin(true);
        try {
            await setTransactionPin(pin);
            setShowPinDialog(false);
            setPin('');
            setConfirmPin('');
            toast({
                title: "PIN Set",
                description: "Your transaction PIN has been set successfully.",
            });
        } catch (err) {
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (err as any).response?.data?.message || "Failed to set PIN.",
                variant: "destructive"
            });
        } finally {
            setSettingPin(false);
        }
    };

    // Session Handlers
    const handleRevokeSession = async (sessionId: string) => {
        try {
            await revokeSession(sessionId);
            await loadSessions();
            toast({
                title: "Session Revoked",
                description: "The session has been terminated.",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to revoke session.",
                variant: "destructive"
            });
            console.error(err);
        }
    };

    const handleRevokeAllSessions = async () => {
        try {
            await revokeAllSessions();
            toast({
                title: "All Sessions Revoked",
                description: "You will be logged out.",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to revoke sessions.",
                variant: "destructive"
            });
            console.error(err);
        }
    };

    // Deactivate Account Handler
    const handleDeactivateAccount = async () => {
        try {
            await deactivateAccount();
            toast({
                title: "Account Deactivated",
                description: "Your account has been deactivated.",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to deactivate account.",
                variant: "destructive"
            });
            console.error(err);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
                    Profile Settings
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Manage your personal information, security, and device sessions.
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-8 lg:grid-cols-3"
            >
                {/* Left Column: Personal Info & Security */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Info */}
                    <motion.div variants={item}>
                        <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-2xl border border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl shadow-sm">
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Personal Details</h2>
                                        <p className="text-sm text-muted-foreground">Your contact and account information.</p>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={user?.phone || ''}
                                                    disabled
                                                    className="pl-9 bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowChangePhoneDialog(true)}
                                                className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={user?.email || 'No email set'}
                                                    disabled
                                                    className="pl-9 bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                            <div className="flex gap-1">
                                                {!user?.emailVerified && user?.email && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleSendVerificationEmail}
                                                        disabled={verifyingEmail}
                                                        className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                                                    >
                                                        {verifyingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowChangeEmailDialog(true)}
                                                    className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="bg-muted/10 dark:bg-black/20"
                                        />
                                    </div>

                                    {/* Address Details */}
                                    <div className="md:col-span-2 space-y-4 pt-2">
                                        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            Address Details
                                        </h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="addressLine1">Address Line 1</Label>
                                                <Input
                                                    id="addressLine1"
                                                    name="addressLine1"
                                                    value={formData.addressLine1}
                                                    onChange={handleChange}
                                                    placeholder="Shop/House No, Street, Area"
                                                    className="bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                                                <Input
                                                    id="addressLine2"
                                                    name="addressLine2"
                                                    value={formData.addressLine2}
                                                    onChange={handleChange}
                                                    placeholder="Landmark, etc."
                                                    className="bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    className="bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">Pincode</Label>
                                                <Input
                                                    id="pincode"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    className="bg-muted/10 dark:bg-black/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-muted/20 dark:bg-white/5 px-6 py-4 flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Active Sessions */}
                    <motion.div variants={item} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-primary" />
                                Active Sessions
                            </h3>
                            {sessions.length > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRevokeAllSessions}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-200 dark:border-red-900/30"
                                >
                                    Revoke All Other Sessions
                                </Button>
                            )}
                        </div>

                        <div className="rounded-2xl border border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden">
                            {loadingSessions ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : sessions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No active sessions found.</div>
                            ) : (
                                <div className="divide-y divide-border/10 dark:divide-white/5">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${session.isCurrent ? 'bg-green-500/10 text-green-500' : 'bg-muted/20 text-muted-foreground'}`}>
                                                    {session.deviceInfo?.includes('Mobile') ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{session.deviceInfo || 'Unknown Device'}</span>
                                                        {session.isCurrent && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Current</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {session.ipAddress} • Active: {new Date(session.lastActive).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <Button variant="ghost" size="icon" onClick={() => handleRevokeSession(session.id)} className="text-muted-foreground hover:text-red-500">
                                                    <XCircle className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Security & Actions */}
                <div className="space-y-6">
                    {/* Security Card */}
                    <motion.div variants={item} className="rounded-2xl border border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">Security</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Password Section */}
                            <div className="p-4 rounded-xl bg-muted/10 dark:bg-black/20 border border-border/10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm">Password</h4>
                                    <Badge variant="outline" className={`text-xs font-normal ${user?.password ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {user?.password ? 'Set' : 'Not Set'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                    {user?.password ? 'Update your account password.' : 'Set a password to login without OTP.'}
                                </p>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowPasswordDialog(true)}>
                                    {user?.password ? 'Change Password' : 'Set Password'}
                                </Button>
                            </div>

                            {/* PIN Section */}
                            <div className="p-4 rounded-xl bg-muted/10 dark:bg-black/20 border border-border/10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm">Transaction PIN</h4>
                                    <Badge variant="outline" className="text-xs font-normal">Active</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Used to verify sensitive actions.
                                </p>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowPinDialog(true)}>
                                    Reset PIN
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={item} className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-red-600/80 dark:text-red-400/80">
                                Deactivating your account will disable all access. You can reactivate by logging in again within 30 days.
                            </p>
                            <Button
                                variant="destructive"
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => setShowDeactivateDialog(true)}
                            >
                                Deactivate Account
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Verify Email Dialog */}
            <Dialog open={showVerifyEmailDialog} onOpenChange={setShowVerifyEmailDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Email</DialogTitle>
                        <DialogDescription>
                            Enter the verification code sent to {user?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Enter 6-digit code"
                            value={verifyEmailOtp}
                            onChange={(e) => setVerifyEmailOtp(e.target.value)}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest font-mono"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVerifyEmailDialog(false)}>Cancel</Button>
                        <Button onClick={handleVerifyEmail} disabled={verifyingEmail || verifyEmailOtp.length !== 6}>
                            {verifyingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Email Dialog */}
            <Dialog open={showChangeEmailDialog} onOpenChange={(open) => {
                setShowChangeEmailDialog(open);
                if (!open) {
                    setChangeEmailStep('input');
                    setNewEmail('');
                    setChangeEmailOtp('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Email</DialogTitle>
                        <DialogDescription>
                            {changeEmailStep === 'input' ? 'Enter your new email address' : 'Enter the verification code sent to your new email'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {changeEmailStep === 'input' ? (
                            <Input
                                type="email"
                                placeholder="new.email@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                        ) : (
                            <Input
                                placeholder="Enter 6-digit code"
                                value={changeEmailOtp}
                                onChange={(e) => setChangeEmailOtp(e.target.value)}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowChangeEmailDialog(false);
                            setChangeEmailStep('input');
                            setNewEmail('');
                            setChangeEmailOtp('');
                        }}>Cancel</Button>
                        {changeEmailStep === 'input' ? (
                            <Button onClick={handleRequestEmailChange} disabled={changingEmail || !newEmail}>
                                {changingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Send Code
                            </Button>
                        ) : (
                            <Button onClick={handleConfirmEmailChange} disabled={changingEmail || changeEmailOtp.length !== 6}>
                                {changingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirm
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Phone Dialog */}
            <Dialog open={showChangePhoneDialog} onOpenChange={(open) => {
                setShowChangePhoneDialog(open);
                if (!open) {
                    setChangePhoneStep('input');
                    setNewPhone('');
                    setChangePhoneOtp('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Phone Number</DialogTitle>
                        <DialogDescription>
                            {changePhoneStep === 'input' ? 'Enter your new phone number' : 'Enter the verification code sent to your new phone'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {changePhoneStep === 'input' ? (
                            <Input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                            />
                        ) : (
                            <Input
                                placeholder="Enter 6-digit code"
                                value={changePhoneOtp}
                                onChange={(e) => setChangePhoneOtp(e.target.value)}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowChangePhoneDialog(false);
                            setChangePhoneStep('input');
                            setNewPhone('');
                            setChangePhoneOtp('');
                        }}>Cancel</Button>
                        {changePhoneStep === 'input' ? (
                            <Button onClick={handleRequestPhoneChange} disabled={changingPhone || !newPhone}>
                                {changingPhone ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Send Code
                            </Button>
                        ) : (
                            <Button onClick={handleConfirmPhoneChange} disabled={changingPhone || changePhoneOtp.length !== 6}>
                                {changingPhone ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirm
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={(open) => {
                setShowPasswordDialog(open);
                if (!open) {
                    setIsForgotPasswordMode(false);
                    setResetStep('request');
                    setResetOtp('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isForgotPasswordMode ? 'Reset Password' : (user?.password ? 'Change Password' : 'Set Password')}
                        </DialogTitle>
                        <DialogDescription>
                            {isForgotPasswordMode
                                ? (resetStep === 'request' ? 'We will send an OTP to your registered phone to reset your password.' : 'Enter the OTP and your new password.')
                                : (user?.password ? 'Enter your current password and a new strong password.' : 'Create a password to login securely.')
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {!isForgotPasswordMode ? (
                            <>
                                {user?.password && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Current Password</Label>
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto text-xs text-primary"
                                                onClick={() => setIsForgotPasswordMode(true)}
                                            >
                                                Forgot Password?
                                            </Button>
                                        </div>
                                        <Input
                                            type="password"
                                            placeholder="Current Password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {resetStep === 'request' ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted/20 rounded-lg text-center">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Select where you want to receive the OTP:
                                            </p>
                                            <div className="flex gap-4 justify-center">
                                                {user?.phone && (
                                                    <Button
                                                        variant={resetMethod === 'phone' ? "default" : "outline"}
                                                        onClick={() => setResetMethod('phone')}
                                                        className="w-32"
                                                    >
                                                        <Smartphone className="w-4 h-4 mr-2" />
                                                        Phone
                                                    </Button>
                                                )}
                                                {user?.email && (
                                                    <Button
                                                        variant={resetMethod === 'email' ? "default" : "outline"}
                                                        onClick={() => setResetMethod('email')}
                                                        className="w-32"
                                                    >
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Email
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-4">
                                                Sending to: <strong>{resetMethod === 'phone' ? user?.phone : user?.email}</strong>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Enter OTP ({resetMethod})</Label>
                                            <Input
                                                placeholder="6-digit OTP"
                                                value={resetOtp}
                                                onChange={(e) => setResetOtp(e.target.value)}
                                                maxLength={6}
                                                className="text-center tracking-widest text-lg font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirm New Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowPasswordDialog(false);
                            setIsForgotPasswordMode(false);
                            setResetStep('request');
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }}>Cancel</Button>

                        {isForgotPasswordMode ? (
                            resetStep === 'request' ? (
                                <Button onClick={handleUpdatePassword} disabled={sendingReset}>
                                    {sendingReset ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Send OTP
                                </Button>
                            ) : (
                                <Button onClick={handleUpdatePassword} disabled={updatingPassword || !newPassword || newPassword !== confirmPassword || resetOtp.length !== 6}>
                                    {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Reset Password
                                </Button>
                            )
                        ) : (
                            <Button onClick={handleUpdatePassword} disabled={updatingPassword || !newPassword || newPassword !== confirmPassword}>
                                {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {user?.password ? 'Update Password' : 'Set Password'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transaction PIN Dialog */}
            <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Transaction PIN</DialogTitle>
                        <DialogDescription>
                            Create a 4-6 digit PIN to secure your transactions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Enter PIN</Label>
                            <Input
                                type="password"
                                placeholder="Enter 4-6 digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm PIN</Label>
                            <Input
                                type="password"
                                placeholder="Confirm PIN"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowPinDialog(false);
                            setPin('');
                            setConfirmPin('');
                        }}>Cancel</Button>
                        <Button onClick={handleSetPin} disabled={settingPin || pin.length < 4 || pin !== confirmPin}>
                            {settingPin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Set PIN
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deactivate Account Dialog */}
            <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate your account and log you out. You can reactivate your account by logging in again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeactivateAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Deactivate Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
