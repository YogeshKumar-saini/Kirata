"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Store, Mail, Phone, ArrowRight, Sparkles, ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneInput } from '@/components/ui/phone-input';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { OTPInput } from '@/components/auth/OTPInput';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { SuccessAnimation } from '@/components/auth/SuccessAnimation';

export default function RegisterPage() {
    const { register, login, registerWithGoogle } = useAuth();
    const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
    const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');
    const [inputType, setInputType] = useState<'phone' | 'email'>('phone');

    const [formData, setFormData] = useState({
        email: '',
        phone: '',
    });
    const [countryCode, setCountryCode] = useState('+91');
    const [otp, setOtp] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const identifier = inputType === 'phone' ? formData.phone : formData.email;
        if (!identifier) {
            setError(`Please provide a ${inputType === 'phone' ? 'phone number' : 'email address'}.`);
            setLoading(false);
            return;
        }

        try {
            await register({
                phone: inputType === 'phone' ? `${countryCode}${formData.phone.replace(/\D/g, '')}` : undefined,
                email: inputType === 'email' ? formData.email : undefined,
                role
            });
            setStep('OTP');
        } catch (err: unknown) {
            let message = 'Registration failed. Please try again.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({
                phone: inputType === 'phone' ? `${countryCode}${formData.phone.replace(/\D/g, '')}` : undefined,
                email: inputType === 'email' ? formData.email : undefined,
                otp,
            });
        } catch (err: unknown) {
            let message = 'Verification failed. Please try again.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"
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
                    className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full"
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
                    className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
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
                                Join the future of
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-400">
                                    retail management
                                </span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Experience seamless shop management with cutting-edge technology.
                                Get started in seconds with just your phone or email.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <motion.div
                                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sparkles className="h-6 w-6 text-primary mb-2" />
                                <p className="text-sm text-gray-300 font-medium">Instant Setup</p>
                                <p className="text-xs text-gray-500">Start in 30 seconds</p>
                            </motion.div>
                            <motion.div
                                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <ShoppingBag className="h-6 w-6 text-blue-400 mb-2" />
                                <p className="text-sm text-gray-300 font-medium">Smart Analytics</p>
                                <p className="text-xs text-gray-500">Real-time insights</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Form with Slider */}
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

                            <AnimatePresence mode="wait">
                                {step === 'DETAILS' ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-8">
                                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                                            <p className="text-gray-400">Choose your role and get started</p>
                                        </div>

                                        <form onSubmit={handleRegister} className="space-y-6">
                                            {/* Role Selection with Slider */}
                                            <div className="relative">
                                                <div className="grid grid-cols-2 gap-0 bg-slate-800/50 rounded-xl p-1 relative">
                                                    {/* Animated Slider Background */}
                                                    <motion.div
                                                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-primary to-blue-600 rounded-lg shadow-lg"
                                                        animate={{
                                                            x: role === 'CUSTOMER' ? 4 : 'calc(100% + 4px)',
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 300,
                                                            damping: 30
                                                        }}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => setRole('CUSTOMER')}
                                                        className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${role === 'CUSTOMER' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                            }`}
                                                    >
                                                        <User className="h-4 w-4" />
                                                        Customer
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRole('SHOPKEEPER')}
                                                        className={`relative z-10 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${role === 'SHOPKEEPER' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                                            }`}
                                                    >
                                                        <Store className="h-4 w-4" />
                                                        Shopkeeper
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Input Type Slider */}
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

                                            {/* Input Field with Animation */}
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
                                                            value={formData.phone}
                                                            onChange={(value) => setFormData({ ...formData, phone: value })}
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
                                                            name="email"
                                                            label="Email Address"
                                                            type="email"
                                                            startIcon={<Mail className="h-5 w-5" />}
                                                            required
                                                            value={formData.email}
                                                            onChange={handleChange}
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

                                            {/* Terms and Conditions */}
                                            <div className="flex items-start space-x-2">
                                                <Checkbox
                                                    id="terms"
                                                    checked={acceptedTerms}
                                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                                    className="mt-1 border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <label
                                                    htmlFor="terms"
                                                    className="text-sm text-gray-400 cursor-pointer select-none leading-relaxed"
                                                >
                                                    I agree to the{' '}
                                                    <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                                                        Terms of Service
                                                    </Link>
                                                    {' '}and{' '}
                                                    <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                                                        Privacy Policy
                                                    </Link>
                                                </label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/30 transition-all duration-300 group"
                                                loading={loading}
                                                disabled={loading || !acceptedTerms}
                                            >
                                                Continue
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>

                                            {/* Social Auth Buttons */}
                                            <SocialAuthButtons
                                                onGoogleSignIn={async (token) => {
                                                    try {
                                                        setLoading(true);
                                                        await registerWithGoogle({ role, token });
                                                    } catch (err: unknown) {
                                                        console.error(err);
                                                        let message = 'Google Registration failed';
                                                        if (axios.isAxiosError(err)) {
                                                            message = err.response?.data?.message || message;
                                                        }
                                                        setError(message);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                onAppleClick={() => console.log('Apple signup')}
                                                disabled={loading}
                                            />
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="otp"
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
                                                className="inline-flex h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 items-center justify-center mb-4 shadow-lg shadow-primary/30"
                                            >
                                                <Mail className="h-8 w-8 text-white" />
                                            </motion.div>
                                            <h2 className="text-3xl font-bold text-white mb-2">Verify Code</h2>
                                            <p className="text-gray-400">
                                                Enter the OTP sent to{' '}
                                                <span className="text-primary font-semibold">
                                                    {inputType === 'phone' ? formData.phone : formData.email}
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
                                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/30 transition-all duration-300"
                                                loading={loading}
                                            >
                                                Verify & Create Account
                                            </Button>

                                            <div className="flex items-center justify-between text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('DETAILS')}
                                                    className="text-gray-400 hover:text-primary transition-colors font-medium"
                                                >
                                                    ← Change {inputType === 'phone' ? 'Phone Number' : 'Email'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRegister}
                                                    disabled={loading}
                                                    className="text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Resend OTP
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {step === 'DETAILS' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-6 text-center"
                                >
                                    <p className="text-sm text-gray-400">
                                        Already have an account?{' '}
                                        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                            Sign in
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
                message="Registration Successful!"
                onComplete={() => {
                    // Redirect will be handled by auth context
                    setShowSuccess(false);
                }}
            />
        </div>
    );
}
