"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mail, Phone, ArrowRight, ArrowLeft, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneInput } from '@/components/ui/phone-input';
import { OTPInput } from '@/components/auth/OTPInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { SuccessAnimation } from '@/components/auth/SuccessAnimation';

type Step = 'IDENTIFIER' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('IDENTIFIER');
    const [inputType, setInputType] = useState<'phone' | 'email'>('email');
    const [countryCode, setCountryCode] = useState('+91');

    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // TODO: Implement API call to request OTP
            const payload = {
                [inputType === 'email' ? 'email' : 'phone']:
                    inputType === 'phone' ? `${countryCode}${identifier.replace(/\D/g, '')}` : identifier
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Request OTP:', payload);

            setStep('VERIFY_OTP');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // TODO: Implement API call to verify OTP
            const payload = {
                [inputType === 'email' ? 'email' : 'phone']:
                    inputType === 'phone' ? `${countryCode}${identifier.replace(/\D/g, '')}` : identifier,
                otp
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Verify OTP:', payload);

            setStep('RESET_PASSWORD');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Validate password strength
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implement API call to reset password
            const payload = {
                [inputType === 'email' ? 'email' : 'phone']:
                    inputType === 'phone' ? `${countryCode}${identifier.replace(/\D/g, '')}` : identifier,
                otp,
                newPassword
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Reset Password:', payload);

            setShowSuccess(true);
            setTimeout(() => {
                setStep('SUCCESS');
            }, 3000);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
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
                    className="absolute bottom-[15%] left-[15%] w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full"
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
                                    <h1 className="text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">Kirata</h1>
                                    <p className="text-sm text-gray-400">Modern Retail Platform</p>
                                </div>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl font-bold tracking-tight text-white leading-tight">
                                Reset your
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-400">
                                    password
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Don&apos;t worry! It happens. Enter your email or phone number and we&apos;ll send you a code to reset your password.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <motion.div
                                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <Lock className="h-6 w-6 text-primary mb-2" />
                                <p className="text-sm text-gray-300 font-medium">Secure Reset</p>
                                <p className="text-xs text-gray-500">OTP verification</p>
                            </motion.div>
                            <motion.div
                                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <CheckCircle2 className="h-6 w-6 text-green-400 mb-2" />
                                <p className="text-sm text-gray-300 font-medium">Quick Process</p>
                                <p className="text-xs text-gray-500">3 simple steps</p>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />

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

                            {/* Progress Indicator */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    {['IDENTIFIER', 'VERIFY_OTP', 'RESET_PASSWORD'].map((s, i) => (
                                        <div key={s} className="flex items-center">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                ${step === s || (['VERIFY_OTP', 'RESET_PASSWORD'].includes(step) && i < 1) || (step === 'RESET_PASSWORD' && i < 2)
                                                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white'
                                                    : 'bg-slate-800 text-gray-500'
                                                }
                                                transition-all duration-300
                                            `}>
                                                {i + 1}
                                            </div>
                                            {i < 2 && (
                                                <div className={`
                                                    w-16 h-1 mx-2
                                                    ${(['VERIFY_OTP', 'RESET_PASSWORD'].includes(step) && i < 1) || (step === 'RESET_PASSWORD' && i < 2)
                                                        ? 'bg-gradient-to-r from-primary to-purple-600'
                                                        : 'bg-slate-800'
                                                    }
                                                    transition-all duration-300
                                                `} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {/* Step 1: Enter Identifier */}
                                {step === 'IDENTIFIER' && (
                                    <motion.div
                                        key="identifier"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-8">
                                            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                                            <p className="text-gray-400">Enter your email or phone number</p>
                                        </div>

                                        {/* Input Type Slider */}
                                        <div className="relative mb-6">
                                            <div className="grid grid-cols-2 gap-0 bg-slate-800/50 rounded-xl p-1 relative">
                                                <motion.div
                                                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg"
                                                    animate={{
                                                        x: inputType === 'email' ? 4 : 'calc(100% + 4px)',
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 30
                                                    }}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setInputType('email')}
                                                    className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${inputType === 'email' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setInputType('phone')}
                                                    className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${inputType === 'phone' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <Phone className="h-4 w-4" />
                                                    Phone
                                                </button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleRequestOtp} className="space-y-4">
                                            <AnimatePresence mode="wait">
                                                {inputType === 'email' ? (
                                                    <motion.div
                                                        key="email"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-2"
                                                    >
                                                        <Label htmlFor="email" className="text-gray-300 font-medium">Email Address</Label>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                            <Input
                                                                id="email"
                                                                type="email"
                                                                placeholder="you@example.com"
                                                                required
                                                                value={identifier}
                                                                onChange={(e) => setIdentifier(e.target.value)}
                                                                className="h-12 pl-11 bg-slate-800/50 border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-gray-500"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ) : (
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
                                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30 transition-all duration-300 group"
                                                loading={loading}
                                            >
                                                Send Reset Code
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>

                                            <div className="text-center">
                                                <Link href="/login" className="text-sm text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-2">
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back to Login
                                                </Link>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Step 2: Verify OTP */}
                                {step === 'VERIFY_OTP' && (
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
                                                className="inline-flex h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-600 items-center justify-center mb-4 shadow-lg shadow-primary/30"
                                            >
                                                <Mail className="h-8 w-8 text-white" />
                                            </motion.div>
                                            <h2 className="text-3xl font-bold text-white mb-2">Verify Code</h2>
                                            <p className="text-gray-400">
                                                Enter the code sent to{' '}
                                                <span className="text-primary font-semibold">
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
                                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30 transition-all duration-300"
                                                loading={loading}
                                            >
                                                Verify & Continue
                                            </Button>

                                            <div className="flex items-center justify-between text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('IDENTIFIER')}
                                                    className="text-gray-400 hover:text-primary transition-colors font-medium"
                                                >
                                                    ← Change {inputType === 'phone' ? 'Phone' : 'Email'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRequestOtp}
                                                    disabled={loading}
                                                    className="text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Resend Code
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Step 3: Reset Password */}
                                {step === 'RESET_PASSWORD' && (
                                    <motion.div
                                        key="reset"
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
                                                className="inline-flex h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-600 items-center justify-center mb-4 shadow-lg shadow-primary/30"
                                            >
                                                <Lock className="h-8 w-8 text-white" />
                                            </motion.div>
                                            <h2 className="text-3xl font-bold text-white mb-2">Create New Password</h2>
                                            <p className="text-gray-400">Choose a strong password for your account</p>
                                        </div>

                                        <form onSubmit={handleResetPassword} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword" className="text-gray-300 font-medium">New Password</Label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors z-10" />
                                                    <Input
                                                        id="newPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        required
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="h-12 pl-11 pr-11 bg-slate-800/50 border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-gray-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-10"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Password Strength Indicator */}
                                            {newPassword && (
                                                <PasswordStrengthIndicator password={newPassword} />
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword" className="text-gray-300 font-medium">Confirm Password</Label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors z-10" />
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm new password"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="h-12 pl-11 pr-11 bg-slate-800/50 border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-gray-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-10"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
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
                                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30 transition-all duration-300 group"
                                                loading={loading}
                                            >
                                                Reset Password
                                                <CheckCircle2 className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                            </Button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Step 4: Success */}
                                {step === 'SUCCESS' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center py-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.1 }}
                                            className="inline-flex h-24 w-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                                        >
                                            <CheckCircle2 className="h-12 w-12 text-white" />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold text-white mb-4">Password Reset Successfully!</h2>
                                        <p className="text-gray-400 mb-8">
                                            Your password has been reset. You can now login with your new password.
                                        </p>
                                        <Link href="/login">
                                            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30">
                                                Go to Login
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Success Animation */}
            <SuccessAnimation
                show={showSuccess}
                message="Password Reset Successfully!"
                onComplete={() => {
                    setShowSuccess(false);
                }}
            />
        </div>
    );
}
