"use client";

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Loader2, PieChart, TrendingUp, IndianRupee, ArrowLeft, BarChart3, ShoppingBag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { PremiumTilt } from '@/components/ui/PremiumTilt';

interface AnalyticsData {
    byCategory: { name: string; value: number }[];
    monthlyTrend: { name: string; value: number }[];
    paymentDistribution: { name: string; value: number }[];
    topShops: { name: string; category: string; amount: number; visits: number }[];
    stats: {
        totalTransactions: number;
        avgOrderValue: number;
    };
}


const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
const PAYMENT_COLORS = ['#10b981', '#3b82f6', '#f43f5e'];

interface LedgerStats {
    monthlyChart: { month: string; gave: number; took: number }[];
}

export default function CustomerAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [ledgerStats, setLedgerStats] = useState<LedgerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [res, ledgerRes] = await Promise.all([
                api.get('/customers/analytics'),
                api.get('/personal-ledger/stats')
            ]);
            setData(res.data);
            setLedgerStats(ledgerRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-slate-400">Failed to load data</div>;

    // Calculate total spend
    const totalSpend = data.byCategory.reduce((sum, item) => sum + item.value, 0);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto p-2 sm:p-4 pb-20">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] p-8 sm:p-10 overflow-hidden shadow-2xl shadow-indigo-500/20 group"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-6">
                            {/* Custom Breadcrumbs */}
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5">
                                <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                                <ChevronRight className="h-3 w-3 opacity-50" />
                                <span className="text-white font-bold">Analytics</span>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Link href="/customer">
                                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 border border-white/5 mr-2">
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                        <BarChart3 className="h-5 w-5 text-indigo-200" />
                                    </div>
                                    <span className="text-indigo-200 font-semibold tracking-wider text-sm uppercase">Financial Insights</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                    Spending <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 animate-gradient-x">Analytics</span>
                                </h1>

                                <p className="text-indigo-200/80 text-lg font-light max-w-lg mt-2">
                                    Visualize your spending habits, track expenses, and manage your budget with ease.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Total Spend Card */}
                <PremiumTilt>
                    <motion.div variants={item} className="h-full relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:to-indigo-900/10 backdrop-blur-xl p-6 group hover:border-indigo-500/40 transition-colors shadow-sm">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-muted-foreground dark:text-indigo-300 uppercase tracking-wider">Total Spending (6 Mo)</p>
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                                    <IndianRupee className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="text-4xl font-black text-foreground dark:text-white mb-2">{formatCurrency(totalSpend)}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="bg-muted dark:bg-white/10 px-2 py-0.5 rounded-lg text-foreground dark:text-white font-medium">{data.stats.totalTransactions}</span> Transactions
                            </div>
                        </div>
                    </motion.div>
                </PremiumTilt>

                {/* Avg Order Value Card */}
                <PremiumTilt>
                    <motion.div variants={item} className="h-full relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 dark:bg-gradient-to-br dark:from-purple-950/40 dark:to-purple-900/10 backdrop-blur-xl p-6 group hover:border-purple-500/40 transition-colors shadow-sm">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-muted-foreground dark:text-purple-300 uppercase tracking-wider">Average Order Value</p>
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="text-4xl font-black text-foreground dark:text-white mb-2">{formatCurrency(data.stats.avgOrderValue)}</div>
                            <div className="text-sm text-muted-foreground">Average spending per visit</div>
                        </div>
                    </motion.div>
                </PremiumTilt>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Payment Distribution Pie Chart */}
                <PremiumTilt className="h-full">
                    <motion.div variants={item} className="h-full rounded-[2rem] border border-border/50 bg-card/50 dark:bg-black/40 backdrop-blur-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                            <div>
                                <h3 className="font-bold text-lg text-foreground dark:text-white">Payment Methods</h3>
                                <p className="text-xs text-muted-foreground">Distribution by transaction count</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={data.paymentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.paymentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--popover-foreground)' }}
                                    />
                                    <Legend iconType="circle" />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </PremiumTilt>

                {/* Category Pie Chart */}
                <PremiumTilt className="h-full">
                    <motion.div variants={item} className="h-full rounded-[2rem] border border-border/50 bg-card/50 dark:bg-black/40 backdrop-blur-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                            <div>
                                <h3 className="font-bold text-lg text-foreground dark:text-white">Spending by Category</h3>
                                <p className="text-xs text-muted-foreground">Where does your money go?</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={data.byCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.byCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                                        contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--popover-foreground)' }}
                                    />
                                    <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: "10px" }} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </PremiumTilt>

                {/* Monthly Trend Bar Chart */}
                <PremiumTilt className="h-full md:col-span-2">
                    <motion.div variants={item} className="h-full rounded-[2rem] border border-border/50 bg-card/50 dark:bg-black/40 backdrop-blur-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            <h3 className="font-bold text-lg text-foreground dark:text-white">Monthly Spending Trend</h3>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyTrend}>
                                    <defs>
                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                    <YAxis
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip
                                        formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                                        cursor={{ fill: 'var(--accent)' }}
                                        contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--popover-foreground)' }}
                                    />
                                    <Bar dataKey="value" fill="url(#colorSpend)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </PremiumTilt>

                {/* Personal Ledger Chart */}
                <PremiumTilt className="h-full md:col-span-2">
                    <motion.div variants={item} className="h-full rounded-[2rem] border border-border/50 bg-card/50 dark:bg-black/40 backdrop-blur-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                            <div>
                                <h3 className="font-bold text-lg text-foreground dark:text-white">Personal Ledger Activity</h3>
                                <p className="text-xs text-muted-foreground">Monthly lending vs. borrowing</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ledgerStats?.monthlyChart || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                                    <Tooltip
                                        formatter={(value: number | undefined) => value !== undefined ? [`₹${value}`, 'Amount'] : ['', 'Amount']}
                                        contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--popover-foreground)' }}
                                        cursor={{ fill: 'var(--accent)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="gave" name="You Gave" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="took" name="You Took" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </PremiumTilt>

                {/* Top Shops */}
                <PremiumTilt className="h-full md:col-span-2">
                    <motion.div variants={item} className="h-full rounded-[2rem] border border-border/50 bg-card/50 dark:bg-black/40 backdrop-blur-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <ShoppingBag className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                            <div>
                                <h3 className="font-bold text-lg text-foreground dark:text-white">Top Shops</h3>
                                <p className="text-xs text-muted-foreground">Your most frequented locations</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {data.topShops.map((shop, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:bg-accent/50 hover:border-orange-500/30 transition-all group gap-4 sm:gap-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-lg text-sm shrink-0">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground group-hover:text-orange-500 transition-colors line-clamp-1">{shop.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap">{shop.category}</span>
                                                <span>•</span>
                                                <span className="whitespace-nowrap">{shop.visits} Visits</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right pl-[3.5rem] sm:pl-0">
                                        <p className="font-bold text-lg text-emerald-500 dark:text-emerald-400">{formatCurrency(shop.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </PremiumTilt>
            </motion.div>
        </div >
    );
}
