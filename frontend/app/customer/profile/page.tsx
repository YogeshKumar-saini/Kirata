"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, Session } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AxiosError } from 'axios';
import { Label } from '@/components/ui/label';

// Components
import { ProfileHeader } from './components/ProfileHeader';
import { QuickPayCard } from './components/QuickPayCard';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { SecurityCard } from './components/SecurityCard';
import { SessionsCard } from './components/SessionsCard';
import { DangerZoneCard } from './components/DangerZoneCard';
import { PreferencesCard } from './components/PreferencesCard';
import { ReviewsCard } from './components/ReviewsCard';

export default function CustomerProfilePage() {
    const { user, updateProfile, sendEmailVerification, verifyEmail, requestEmailChange, confirmEmailChange, requestPhoneChange, confirmPhoneChange, listSessions, revokeSession, revokeAllSessions, deactivateAccount, requestPasswordReset, confirmPasswordReset } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        address: user?.address || '',
        addressLine1: user?.addressLine1 || '',
        addressLine2: user?.addressLine2 || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
        gender: user?.gender || '',
        dateOfBirth: user?.dateOfBirth || ''
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

    // Password Reset
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);

    const [passwordStep, setPasswordStep] = useState<'input' | 'verify'>('input');
    const [passwordOtp, setPasswordOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Sessions
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Deactivate Account
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

    const loadSessions = useCallback(async () => {
        setLoadingSessions(true);
        try {
            const sessionList = await listSessions();
            // Handle different response formats safely
            let sessionsArray: Session[] = [];
            if (Array.isArray(sessionList)) {
                sessionsArray = sessionList;
            } else if (sessionList && typeof sessionList === 'object' && 'sessions' in sessionList) {
                sessionsArray = (sessionList as { sessions: Session[] }).sessions;
            }
            setSessions(sessionsArray);
        } catch (err) {
            console.error('Failed to load sessions', err);
            setSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    }, [listSessions]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Preferences Update
    const handlePreferencesUpdate = async (newPrefs: { notificationPrefs: import('@/context/auth-context').NotificationPrefs }) => {
        try {
            await updateProfile(newPrefs);
            toast({
                title: "Preferences Updated",
                description: "Your notification settings have been saved.",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Failed to update preferences.",
                variant: "destructive"
            });
        }
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
        } catch (err: unknown) {
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
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to send verification code.";
            toast({
                title: "Error",
                description: message,
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
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to verify email.";
            toast({
                title: "Error",
                description: message,
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
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to send verification code.";
            toast({
                title: "Error",
                description: message,
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
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to change email.";
            toast({
                title: "Error",
                description: message,
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
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to send verification code.";
            toast({
                title: "Error",
                description: message,
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
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to change phone.";
            toast({
                title: "Error",
                description: message,
                variant: "destructive"
            });
        } finally {
            setChangingPhone(false);
        }
    };

    const openPasswordDialog = () => {
        setShowPasswordDialog(true);
        setPasswordStep('input');
        resetPasswordState();
    };

    // Password Reset Handlers
    const handleRequestPasswordReset = async () => {
        if (!user?.email && !user?.phone) {
            toast({
                title: "Error",
                description: "You need a verified email or phone to set a password.",
                variant: "destructive"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive"
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters long.",
                variant: "destructive"
            });
            return;
        }

        setChangingPassword(true);
        try {
            await requestPasswordReset({
                email: user.email || undefined,
                phone: user.phone || undefined
            });

            toast({
                title: "Verification Code Sent",
                description: `A code has been sent to your ${user.email ? 'email' : 'phone'}`,
            });
            setPasswordStep('verify');
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to send verification code.";
            toast({
                title: "Error",
                description: message,
                variant: "destructive"
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleConfirmPasswordReset = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive"
            });
            return;
        }

        setChangingPassword(true);
        try {
            await confirmPasswordReset({
                email: user?.email || undefined,
                phone: user?.phone || undefined
            }, passwordOtp, newPassword);

            setShowPasswordDialog(false);
            resetPasswordState();

            toast({
                title: "Password Updated",
                description: "Your password has been successfully set. Please login again.",
            });
        } catch (err: unknown) {
            const message = err instanceof AxiosError ? err.response?.data?.message : "Failed to set password.";
            toast({
                title: "Error",
                description: message,
                variant: "destructive"
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const resetPasswordState = () => {
        setPasswordOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        // passwordStep is managed by openPasswordDialog usually, but good to reset here if needed
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
        } catch {
            toast({
                title: "Error",
                description: "Failed to revoke session.",
                variant: "destructive"
            });
        }
    };

    const handleRevokeAllSessions = async () => {
        try {
            await revokeAllSessions();
            toast({
                title: "All Sessions Revoked",
                description: "You will be logged out.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to revoke sessions.",
                variant: "destructive"
            });
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
        } catch (err: unknown) {
            console.error(err);
            toast({
                title: "Error",
                description: "Failed to deactivate account.",
                variant: "destructive"
            });
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
        <div className="space-y-8 p-1 sm:p-2 max-w-6xl mx-auto">
            <ProfileHeader />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 lg:grid-cols-3"
            >
                <QuickPayCard userId={user?.id} variants={item} />

                <ReviewsCard variants={item} />

                <PersonalInfoCard
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    saving={saving}
                    variants={item}
                />

                <PreferencesCard
                    preferences={user?.notificationPrefs}
                    onUpdate={handlePreferencesUpdate}
                    variants={item}
                />

                <SecurityCard
                    user={user}
                    variants={item}
                    onPhoneChange={() => setShowChangePhoneDialog(true)}
                    onEmailChange={() => setShowChangeEmailDialog(true)}
                    onVerifyEmail={handleSendVerificationEmail}
                    onChangePassword={openPasswordDialog}
                    isVerifyingEmail={verifyingEmail}
                />

                <SessionsCard
                    sessions={sessions}
                    loading={loadingSessions}
                    onRevoke={handleRevokeSession}
                    onRevokeAll={handleRevokeAllSessions}
                    variants={item}
                />

                <DangerZoneCard
                    onDeactivate={() => setShowDeactivateDialog(true)}
                    variants={item}
                />
            </motion.div>

            {/* Dialogs */}
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

            {/* Password Reset Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={(open) => {
                setShowPasswordDialog(open);
                if (!open) resetPasswordState();
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Password</DialogTitle>
                        <DialogDescription>
                            {passwordStep === 'input' ? 'Set your new password first.' : 'Enter the verification code sent to you.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {passwordStep === 'input' ? (
                            <>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label>Verification Code</Label>
                                <Input
                                    placeholder="Enter 6-digit code"
                                    value={passwordOtp}
                                    onChange={(e) => setPasswordOtp(e.target.value)}
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest font-mono"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                        {passwordStep === 'input' ? (
                            <Button onClick={handleRequestPasswordReset} disabled={changingPassword || !newPassword || !confirmPassword}>
                                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Continue
                            </Button>
                        ) : (
                            <Button onClick={handleConfirmPasswordReset} disabled={changingPassword || passwordOtp.length !== 6}>
                                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Set Password
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
        </div>
    );
}
