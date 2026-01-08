"use client";

import React, { useEffect, useState } from 'react';
import { DashboardSkeleton } from '@/components/customer/dashboard-skeleton';
import { Button } from '@/components/ui/button';
import { PremiumTilt } from "@/components/ui/PremiumTilt";
import api from '@/lib/api';
import {
    IndianRupee,
    ArrowRight,
    Store,
    Wallet,
    CreditCard,
    Clock,
    Search,
    Sparkles,
    Zap,
    ChevronRight,
    ShoppingBag,
    QrCode,
    Scan,
    Gift,
    Award
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RecentActivityItem {
    saleId: string;
    createdAt: string;
    paymentType: string;
    amount: number;
    shop?: {
        name: string;
        photoUrl?: string;
    };
}

interface DashboardStats {
    totalUdhaar: number;
    activeOrdersCount: number;
    recentActivity: RecentActivityItem[];
    loyaltyPoints: number;
    promotionalOffer?: {
        id: string;
        title: string;
        description: string;
    };
}

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [greeting, setGreeting] = useState("Welcome back");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/customers/dashboard');
            // Artificial delay for smoother loading animation experience
            await new Promise(resolve => setTimeout(resolve, 800));
            setStats(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3
            }
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-6 text-center">
                <div className="rounded-full bg-red-500/10 p-6 ring-1 ring-red-500/20">
                    <Zap className="h-10 w-10 text-red-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Something went wrong</h3>
                    <p className="text-muted-foreground mt-2">{error}</p>
                </div>
                <Button onClick={() => window.location.reload()} size="lg" className="rounded-full">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto p-2 sm:p-4">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col md:flex-row justify-between items-end gap-6 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 dark:from-[#1e1b4b] dark:via-[#312e81] dark:to-[#0f172a] p-8 sm:p-12 text-white shadow-2xl shadow-indigo-500/20 group"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 space-y-6 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 text-indigo-100 dark:text-indigo-200 font-medium px-4 py-1.5 rounded-full bg-white/10 dark:bg-white/5 w-fit border border-white/20 dark:border-white/10 backdrop-blur-md shadow-inner"
                        >
                            <Sparkles className="h-4 w-4 fill-indigo-100 dark:fill-indigo-200" />
                            <span className="text-xs uppercase tracking-[0.2em] font-bold">Premium Member</span>
                        </motion.div>

                        {/* Loyalty Pill */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 text-amber-200 font-medium px-4 py-1.5 rounded-full bg-amber-500/10 w-fit border border-amber-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                            <Award className="h-4 w-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-100">{stats?.loyaltyPoints || 0} Points</span>
                        </motion.div>
                    </div>

                    <div>
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-2 leading-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200 animate-gradient-x">{user?.name?.split(' ')[0] || 'Friend'}</span>
                        </h1>
                        <p className="text-indigo-100/90 dark:text-indigo-200/80 text-lg md:text-xl font-light leading-relaxed max-w-lg">
                            Ready to discover local lifestyle?
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Button size="lg" className="rounded-full bg-white text-indigo-950 hover:bg-indigo-50 dark:hover:bg-white/90 font-bold px-8 h-14 shadow-xl shadow-white/10 transition-transform hover:scale-105 hover:shadow-white/20 active:scale-95 text-base">
                            <Scan className="mr-2 h-5 w-5" /> Scan QR to Pay
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full border-white/30 dark:border-white/20 bg-white/10 dark:bg-white/5 text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-md px-8 h-14 text-base font-medium hover:scale-105 transition-transform" asChild>
                            <Link href="/customer/shops">
                                <Store className="mr-2 h-5 w-5" /> Browse Shops
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* QR Code Quick View (Mock) */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative z-10 hidden md:block"
                >
                    <PremiumTilt>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl border border-white/20 cursor-pointer group hover:bg-white/20 transition-colors duration-500">
                            <div className="bg-white p-4 rounded-3xl shadow-inner">
                                <div className="h-32 w-32 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                    <QrCode className="h-20 w-20 text-white group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                                </div>
                            </div>
                            <p className="text-center text-white/80 font-bold mt-3 text-xs uppercase tracking-widest">My Personal ID</p>
                        </div>
                    </PremiumTilt>
                </motion.div>
            </motion.div>

            {/* Bento Grid Stats */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-[2000px]"
            >
                {/* Total Udhaar Card - Featured */}
                <div className="md:col-span-2 relative h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Card className="h-full border-0 bg-card/60 dark:bg-black/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden relative border-border/5 dark:border-white/5 ring-1 ring-border/10 dark:ring-white/10 group">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                    <IndianRupee className="h-64 w-64" />
                                </div>

                                <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">Total Outstanding</p>
                                            <h2 className={cn(
                                                "text-5xl md:text-7xl font-bold tracking-tighter mt-2 drop-shadow-2xl",
                                                (stats?.totalUdhaar || 0) > 0 ? "text-red-500" : "text-emerald-500"
                                            )}>
                                                {formatCurrency(stats?.totalUdhaar || 0)}
                                            </h2>
                                        </div>
                                        <div className={cn("p-4 rounded-2xl shadow-inner", (stats?.totalUdhaar || 0) > 0 ? "bg-red-500/10 ring-1 ring-red-500/20" : "bg-emerald-500/10 ring-1 ring-emerald-500/20")}>
                                            <Wallet className={cn("h-8 w-8", (stats?.totalUdhaar || 0) > 0 ? "text-red-500" : "text-emerald-500")} />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-end justify-between">
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground font-medium">
                                                {(stats?.totalUdhaar || 0) > 0
                                                    ? "You have payments to settle"
                                                    : "All clear! No pending dues."}
                                            </p>
                                            {(stats?.totalUdhaar || 0) > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Progress value={65} className="w-32 h-2 bg-red-100 dark:bg-red-950/50" indicatorClassName="bg-gradient-to-r from-red-600 to-red-400" />
                                                    <span className="text-xs text-red-500 font-bold">Limit 65%</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="secondary" className="rounded-full px-6 shadow-lg shadow-black/5 hover:scale-105 transition-transform" asChild>
                                            <Link href="/customer/ledger">
                                                View Ledger <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </PremiumTilt>
                </div>

                {/* Active Orders */}
                <div className="md:col-span-1 relative h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <Card className="h-full border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 rounded-[2.5rem] overflow-hidden border-border/5 dark:border-white/5 ring-1 ring-border/10 dark:ring-white/10 group">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                            <ShoppingBag className="h-5 w-5" />
                                        </div>
                                        Active Orders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2 mt-2">
                                        {stats?.activeOrdersCount || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-8">Orders in progress</p>
                                    <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:translate-x-1 transition-all" asChild>
                                        <Link href="/customer/orders">
                                            Track <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </PremiumTilt>
                </div>

                {/* Exclusive Offers (New Feature) */}
                <div className="md:col-span-1 relative h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <Card className="h-full border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20 hover:shadow-orange-500/40 transition-all duration-300 rounded-[2.5rem] overflow-hidden relative group">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                                <div className="absolute -bottom-4 -right-4 text-amber-300/20 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                    <Gift className="h-32 w-32" />
                                </div>

                                <CardHeader className="relative z-10">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                        Pick of the Day
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-4xl font-bold mb-1 leading-tight drop-shadow-md">
                                        20% OFF
                                    </div>
                                    <p className="text-amber-100 font-medium text-sm mb-6 max-w-[150px]">On Fresh Dairy at Sharma General Store</p>
                                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer hover:bg-white/30 transition-colors">
                                        Claim Now
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </PremiumTilt>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <motion.div
                    variants={item}
                    className="lg:col-span-2 rounded-[2.5rem] border border-border/5 dark:border-white/5 bg-muted/20 dark:bg-black/20 backdrop-blur-2xl p-8 shadow-inner ring-1 ring-border/10 dark:ring-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Recent Activity</h2>
                            <p className="text-muted-foreground">Your latest interactions</p>
                        </div>
                        <Button variant="outline" className="rounded-full border-border/10 dark:border-white/10 hover:bg-muted/20 dark:hover:bg-white/5 bg-transparent" asChild>
                            <Link href="/customer/orders">View History</Link>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                                <div className="bg-muted/30 p-6 rounded-full mb-4 animate-pulse">
                                    <Clock className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-xl">No Recent Activity</h3>
                                <p className="max-w-xs mx-auto mt-2 text-muted-foreground">
                                    Your recent orders and payments will appear here once you start shopping.
                                </p>
                            </div>
                        ) : (
                            stats.recentActivity.map((sale, i) => (
                                <motion.div
                                    key={sale.saleId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-[2rem] hover:bg-muted/20 dark:hover:bg-white/[0.03] border border-transparent hover:border-border/10 dark:hover:border-white/10 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="flex items-center gap-6 w-full sm:w-auto">
                                        <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner text-2xl font-bold border border-border/5 dark:border-white/5 overflow-hidden relative group-hover:scale-105 transition-transform",
                                            sale.shop?.photoUrl ? "bg-cover bg-center" : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500"
                                        )}
                                            style={sale.shop?.photoUrl ? { backgroundImage: `url(${sale.shop.photoUrl})` } : {}}
                                        >
                                            {!sale.shop?.photoUrl && (sale.shop?.name?.charAt(0) || <Store className="h-6 w-6" />)}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{sale.shop?.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                        <Badge variant="secondary" className={cn(
                                            "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                                            sale.paymentType === 'UDHAAR'
                                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            {sale.paymentType}
                                        </Badge>

                                        <div className="text-right min-w-[100px]">
                                            <div className="text-xl font-bold tracking-tight">
                                                {formatCurrency(sale.amount)}
                                            </div>
                                        </div>

                                        <div className="h-10 w-10 rounded-full border border-border/10 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-md">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Side Widgets */}
                <motion.div
                    variants={item}
                    className="space-y-6"
                >
                    {/* Discovery Card */}
                    <div className="h-56">
                        <PremiumTilt className="h-full">
                            <Link href="/customer/shops/discover" className="block group h-full">
                                <Card className="h-full border-0 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 rounded-[2.5rem] overflow-hidden relative cursor-pointer">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500">
                                        <Search className="h-40 w-40" />
                                    </div>
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="flex items-center gap-3 text-lg">
                                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner transition-transform group-hover:scale-110">
                                                <Search className="h-5 w-5 text-white" />
                                            </div>
                                            New in Town
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10 flex flex-col justify-between h-[calc(100%-80px)]">
                                        <p className="text-purple-100 font-medium text-lg leading-snug max-w-[200px]">Explore 5 new shops added near you this week.</p>
                                        <div className="flex justify-end">
                                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-purple-600 transition-all">
                                                <ArrowRight className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </PremiumTilt>
                    </div>

                    {/* Quick Access */}
                    <div className="rounded-[2.5rem] border border-border/5 dark:border-white/5 bg-muted/20 dark:bg-black/20 backdrop-blur-xl p-6 shadow-inner ring-1 ring-border/10 dark:ring-white/10">
                        <h3 className="font-bold text-lg mb-4 px-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <Link href="/customer/shops" className="flex items-center justify-between p-4 rounded-3xl bg-card/40 dark:bg-white/[0.03] hover:bg-card/80 dark:hover:bg-white/[0.08] border border-transparent hover:border-border/5 dark:hover:border-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">My Shops</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                            <Link href="/customer/profile" className="flex items-center justify-between p-4 rounded-3xl bg-card/40 dark:bg-white/[0.03] hover:bg-card/80 dark:hover:bg-white/[0.08] border border-transparent hover:border-border/5 dark:hover:border-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">Settings</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                            <Link href="/customer/personal-ledger" className="flex items-center justify-between p-4 rounded-3xl bg-card/40 dark:bg-white/[0.03] hover:bg-card/80 dark:hover:bg-white/[0.08] border border-transparent hover:border-border/5 dark:hover:border-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">My Khatabook</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div >
    );
}
