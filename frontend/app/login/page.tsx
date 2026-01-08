"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Store, Mail, Phone, Lock, ArrowRight, Sparkles, Shield, Zap, Eye, EyeOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneInput } from '@/components/ui/phone-input';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { OTPInput } from '@/components/auth/OTPInput';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { SuccessAnimation } from '@/components/auth/SuccessAnimation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


export default function LoginPage() {
    const { login, requestOtp, loginWithGoogle, registerWithGoogle } = useAuth();
    const [method, setMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
    const [step, setStep] = useState<'INPUT' | 'VERIFY'>('INPUT');
    const [inputType, setInputType] = useState<'phone' | 'email'>('phone');
    const [countryCode, setCountryCode] = useState('+91');

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Google Auth State
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);

    const isEmail = (val: string) => val.includes('@');

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let finalIdentifier = identifier;
            if (!isEmail(identifier)) {
                // Assume phone number if not email
                const digits = identifier.replace(/\D/g, '');
                // If user didn't add country code (no +), and we have 10 digits, assume +91 (default)
                // Or use the countryCode state if we want to be consistent with the hidden state
                if (!identifier.startsWith('+')) {
                    finalIdentifier = `${countryCode}${digits}`;
                }
            }

            const payload = {
                [isEmail(identifier) ? 'email' : 'phone']: finalIdentifier,
                password,
            };
            await login(payload);
        } catch (err: unknown) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { [inputType === 'email' ? 'email' : 'phone']: inputType === 'phone' ? `${countryCode}${identifier.replace(/\D/g, '')}` : identifier };
            await requestOtp(payload);
            setStep('VERIFY');
        } catch (err: unknown) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                [inputType === 'email' ? 'email' : 'phone']: inputType === 'phone' ? `${countryCode}${identifier.replace(/\D/g, '')}` : identifier,
                otp,
            };
            await login(payload);
        } catch (err: unknown) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    const handleError = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || 'Action failed. Please try again.');
        } else {
            setError('An unexpected error occurred.');
        }
    }

    const handleGoogleSignIn = async (token: string) => {
        try {
            setLoading(true);
            await loginWithGoogle(token);
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'message' in err && err.message === 'ROLE_REQUIRED') {
                setPendingGoogleToken(token);
                setShowRoleDialog(true);
            } else {
                handleError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelection = async (role: 'SHOPKEEPER' | 'CUSTOMER') => {
        if (!pendingGoogleToken) return;
        try {
            setLoading(true);
            await registerWithGoogle({ role, token: pendingGoogleToken });
            setShowRoleDialog(false);
        } catch (err: unknown) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[15%] right-[15%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[15%] left-[15%] w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full"
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
                <motion.div
                    className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Left Side: Hero */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
                <div className="relative z-10 max-w-lg space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-2xl shadow-primary/50 group-hover:scale-105 transition-transform">
                                    <img
                                        src="/logo-icon.png"
                                        alt="Kirata Logo"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white group-hover:text-primary transition-colors">Kirata</h1>
                                    <p className="text-sm text-gray-400">Modern Retail Platform</p>
                                </div>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl font-bold tracking-tight text-white leading-tight">
                                Welcome back to
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-400">
                                    your dashboard
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Access your shop management tools, track inventory, manage customers,
                                and grow your business with powerful analytics.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <motion.div
                                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <Shield className="h-6 w-6 text-cyan-400 mb-2" />
                                <p className="text-sm text-gray-300 font-medium">Secure Login</p>
                                <p className="text-xs text-gray-500">Bank-level security</p>
                            </motion.div>
                            <motion.div
                                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <Zap className="h-6 w-6 text-primary mb-2" />
                                <p className="text-sm text-gray-300 font-medium">Quick Access</p>
                                <p className="text-xs text-gray-500">Login in seconds</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-0 shadow-2xl bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
                        {/* Card Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 pointer-events-none" />

                        <div className="relative z-10 p-8">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex justify-center mb-6">
                                <Link href="/" className="inline-block group">
                                    <div className="h-14 w-14 rounded-xl overflow-hidden shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                                        <img
                                            src="/logo-icon.png"
                                            alt="Kirata Logo"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                </Link>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 'INPUT' ? (
                                    <motion.div
                                        key="input"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-8">
                                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                                            <p className="text-gray-400">Sign in to continue to your account</p>
                                        </div>

                                        {/* Login Method Slider */}
                                        <div className="relative mb-6">
                                            <div className="grid grid-cols-2 gap-0 bg-slate-800/50 rounded-xl p-1 relative">
                                                <motion.div
                                                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-primary to-cyan-600 rounded-lg shadow-lg"
                                                    animate={{
                                                        x: method === 'PASSWORD' ? 4 : 'calc(100% + 4px)',
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 30
                                                    }}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => { setMethod('PASSWORD'); setError(''); }}
                                                    className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${method === 'PASSWORD' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <Lock className="h-4 w-4" />
                                                    Password
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setMethod('OTP'); setError(''); }}
                                                    className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${method === 'OTP' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                    OTP
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {method === 'PASSWORD' ? (
                                                <motion.form
                                                    key="password"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    onSubmit={handlePasswordLogin}
                                                    className="space-y-4"
                                                >
                                                    <div className="space-y-4">
                                                        <FloatingLabelInput
                                                            id="identifier"
                                                            label="Phone or Email"
                                                            type="text"
                                                            startIcon={<Mail className="h-5 w-5" />}
                                                            required
                                                            value={identifier}
                                                            onChange={(e) => setIdentifier(e.target.value)}
                                                            className="bg-slate-800/50 border-slate-700 focus:border-primary focus:ring-primary/20 text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <FloatingLabelInput
                                                            id="password"
                                                            label="Password"
                                                            type={showPassword ? "text" : "password"}
                                                            startIcon={<Lock className="h-5 w-5" />}
                                                            endIcon={
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="hover:text-white transition-colors focus:outline-none flex items-center justify-center h-full w-full"
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="h-5 w-5" />
                                                                    ) : (
                                                                        <Eye className="h-5 w-5" />
                                                                    )}
                                                                </button>
                                                            }
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="bg-slate-800/50 border-slate-700 focus:border-primary focus:ring-primary/20 text-white"
                                                        />
                                                        <div className="flex justify-end">
                                                            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                                                Forgot Password?
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {/* Remember Me */}
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="remember"
                                                            checked={rememberMe}
                                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                                            className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <label
                                                            htmlFor="remember"
                                                            className="text-sm text-gray-400 cursor-pointer select-none"
                                                        >
                                                            Remember me for 30 days
                                                        </label>
                                                    </div>
                                                    {error && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                                        >
                                                            <p className="text-sm text-red-400 font-medium">{error}</p>
                                                        </motion.div>
                                                    )}
                                                    <Button
                                                        type="submit"
                                                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 shadow-lg shadow-primary/30 transition-all duration-300 group"
                                                        loading={loading}
                                                    >
                                                        Sign In
                                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                    </Button>

                                                    {/* Social Auth Buttons */}
                                                    <SocialAuthButtons
                                                        onGoogleSignIn={handleGoogleSignIn}
                                                        onAppleClick={() => console.log('Apple login')}
                                                        disabled={loading}
                                                    />
                                                </motion.form>
                                            ) : (
                                                <motion.div
                                                    key="otp"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-4"
                                                >
                                                    {/* Input Type Slider for OTP */}
                                                    <div className="relative">
                                                        <div className="grid grid-cols-2 gap-0 bg-slate-800/50 rounded-xl p-1 relative">
                                                            <motion.div
                                                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg"
                                                                animate={{
                                                                    x: inputType === 'phone' ? 4 : 'calc(100% + 4px)',
                                                                }}
                                                                transition={{
                                                                    type: "spring",
                                                                    stiffness: 300,
                                                                    damping: 30
                                                                }}
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() => setInputType('phone')}
                                                                className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${inputType === 'phone' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                                    }`}
                                                            >
                                                                <Phone className="h-4 w-4" />
                                                                Phone
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setInputType('email')}
                                                                className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${inputType === 'email' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                                    }`}
                                                            >
                                                                <Mail className="h-4 w-4" />
                                                                Email
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={handleRequestOtp} className="space-y-4">
                                                        <AnimatePresence mode="wait">
                                                            {inputType === 'phone' ? (
                                                                <motion.div
                                                                    key="phone"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="space-y-2"
                                                                >
                                                                    <Label htmlFor="phone" className="text-gray-300 font-medium">Phone Number</Label>
                                                                    <PhoneInput
                                                                        value={identifier}
                                                                        onChange={setIdentifier}
                                                                        countryCode={countryCode}
                                                                        onCountryCodeChange={setCountryCode}
                                                                        placeholder="99999 99999"
                                                                        required
                                                                    />
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key="email"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="space-y-2"
                                                                >
                                                                    <FloatingLabelInput
                                                                        id="email"
                                                                        label="Email Address"
                                                                        type="email"
                                                                        startIcon={<Mail className="h-5 w-5" />}
                                                                        required
                                                                        value={identifier}
                                                                        onChange={(e) => setIdentifier(e.target.value)}
                                                                        className="bg-slate-800/50 border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 text-white"
                                                                    />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        {error && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                                            >
                                                                <p className="text-sm text-red-400 font-medium">{error}</p>
                                                            </motion.div>
                                                        )}

                                                        <Button
                                                            type="submit"
                                                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-600/90 hover:to-pink-600/90 shadow-lg shadow-purple-500/30 transition-all duration-300 group"
                                                            loading={loading}
                                                        >
                                                            Get OTP
                                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="verify"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-8">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", delay: 0.1 }}
                                                className="inline-flex h-16 w-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 items-center justify-center mb-4 shadow-lg shadow-purple-500/30"
                                            >
                                                <Sparkles className="h-8 w-8 text-white" />
                                            </motion.div>
                                            <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
                                            <p className="text-gray-400">
                                                Enter the code sent to{' '}
                                                <span className="text-purple-400 font-semibold">
                                                    {identifier}
                                                </span>
                                            </p>
                                        </div>

                                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                                            <div className="space-y-2">
                                                <OTPInput
                                                    value={otp}
                                                    onChange={setOtp}
                                                    onComplete={(value) => {
                                                        setOtp(value);
                                                    }}
                                                    disabled={loading}
                                                />
                                            </div>

                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                                >
                                                    <p className="text-sm text-red-400 font-medium">{error}</p>
                                                </motion.div>
                                            )}

                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-600/90 hover:to-pink-600/90 shadow-lg shadow-purple-500/30 transition-all duration-300"
                                                loading={loading}
                                            >
                                                Verify & Sign In
                                            </Button>

                                            <div className="flex items-center justify-between text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('INPUT')}
                                                    className="text-gray-400 hover:text-purple-400 transition-colors font-medium"
                                                >
                                                    ← Change {inputType === 'phone' ? 'Phone Number' : 'Email'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRequestOtp}
                                                    disabled={loading}
                                                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Resend OTP
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step === 'INPUT' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-6 text-center"
                                >
                                    <p className="text-sm text-gray-400">
                                        Don&apos;t have an account?{' '}
                                        <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                            Sign up for free
                                        </Link>
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Success Animation */}
            <SuccessAnimation
                show={showSuccess}
                message="Login Successful!"
                onComplete={() => {
                    // Redirect will be handled by auth context
                    setShowSuccess(false);
                }}
            />
            {/* Role Selection Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center mb-2">Choose Account Type</DialogTitle>
                        <DialogDescription className="text-gray-400 text-center">
                            We didn&apos;t find an existing account. Please select how you want to join Kirata.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <button
                            onClick={() => handleRoleSelection('CUSTOMER')}
                            className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-transparent hover:border-primary transition-all duration-200 group"
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <span className="font-semibold text-white">Customer</span>
                            <span className="text-xs text-slate-400 mt-1">I want to buy items</span>
                        </button>

                        <button
                            onClick={() => handleRoleSelection('SHOPKEEPER')}
                            className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-transparent hover:border-cyan-500 transition-all duration-200 group"
                        >
                            <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Store className="h-6 w-6 text-cyan-500" />
                            </div>
                            <span className="font-semibold text-white">Shopkeeper</span>
                            <span className="text-xs text-slate-400 mt-1">I want to sell items</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
