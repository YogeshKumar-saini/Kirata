"use client";

import React, { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Loader2, Plus, ArrowUpRight, ArrowDownLeft, Search, User, TrendingUp, BarChart3, Wallet, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { AddLedgerEntryDialog } from '@/components/customer/add-ledger-entry-dialog';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Area, AreaChart, CartesianGrid, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumTilt } from '@/components/ui/PremiumTilt';

interface Contact {
    contactPhone: string;
    contactName: string;
    totalGave: number;
    totalTook: number;
    balance: number;
    lastTransaction: string;
    isLinked: boolean;
}

interface LedgerDashboardStats {
    insight: {
        highestToTake: { contactName: string; balance: number } | null;
        highestToGive: { contactName: string; balance: number } | null;
    };
    monthlyChart: { month: string; gave: number; took: number }[];
    balanceHistory: { date: string; balance: number }[];
}

export default function PersonalLedgerPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [stats, setStats] = useState<LedgerDashboardStats | null>(null);

    const fetchData = useCallback(async () => {
        try {
            if (contacts.length === 0) setLoading(true);
            const [contactsRes, statsRes] = await Promise.all([
                api.get('/personal-ledger/contacts'),
                api.get('/personal-ledger/stats')
            ]);
            setContacts(contactsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [contacts.length]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredContacts = contacts.filter(c =>
        c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPhone.includes(searchTerm)
    );

    const totalToTake = contacts.reduce((acc, c) => c.balance > 0 ? acc + c.balance : acc, 0);
    const totalToGive = contacts.reduce((acc, c) => c.balance < 0 ? acc + Math.abs(c.balance) : acc, 0);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 min-h-screen pb-20 max-w-[1600px] mx-auto p-2 sm:p-4">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#312e81] p-8 sm:p-10 overflow-hidden shadow-2xl shadow-cyan-500/10 group"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-6">
                        {/* Custom Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-cyan-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5">
                            <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <span className="text-white font-bold">Personal Ledger</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                    <Wallet className="h-5 w-5 text-cyan-200" />
                                </div>
                                <span className="text-cyan-200 font-semibold tracking-wider text-sm uppercase">Personal Finance</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 animate-gradient-x">Khatabook</span>
                            </h1>

                            <p className="text-cyan-200/80 text-lg font-light max-w-lg mt-2">
                                Keep track of money you owe and money owed to you with friends and family.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setAddDialogOpen(true)}
                        className="rounded-2xl h-12 px-6 bg-cyan-500 hover:bg-cyan-400 text-white border-0 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all font-semibold text-base group/btn"
                    >
                        <Plus className="mr-2 h-5 w-5 transition-transform group-hover/btn:rotate-90" />
                        Add New Entry
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <PremiumTilt>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/10 backdrop-blur-xl p-6 group hover:border-emerald-500/40 transition-colors h-full"
                    >
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <ArrowDownLeft className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">You Will Get</p>
                            </div>

                            <div className="text-4xl font-black text-emerald-400 mb-4">{formatCurrency(totalToTake)}</div>

                            {stats?.insight?.highestToTake && (
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                    <User className="h-3 w-3 text-emerald-400" />
                                    <span className="text-xs text-emerald-300">Highest: <span className="font-bold text-emerald-200">{stats.insight.highestToTake.contactName}</span> ({formatCurrency(stats.insight.highestToTake.balance)})</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </PremiumTilt>

                <PremiumTilt>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-50/50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/10 backdrop-blur-xl p-6 group hover:border-rose-500/40 transition-colors h-full"
                    >
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500/10 blur-[40px] pointer-events-none group-hover:bg-rose-500/20 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-bold text-rose-400 uppercase tracking-wider">You Will Give</p>
                            </div>

                            <div className="text-4xl font-black text-rose-400 mb-4">{formatCurrency(totalToGive)}</div>

                            {stats?.insight?.highestToGive && (
                                <div className="inline-flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                                    <User className="h-3 w-3 text-rose-400" />
                                    <span className="text-xs text-rose-300">Highest: <span className="font-bold text-rose-200">{stats.insight.highestToGive.contactName}</span> ({formatCurrency(Math.abs(stats.insight.highestToGive.balance))})</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </PremiumTilt>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {stats?.monthlyChart && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[2rem] border border-border/10 dark:border-white/5 bg-card/40 dark:bg-black/40 backdrop-blur-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-indigo-400" />
                            <h3 className="font-bold text-lg text-foreground dark:text-white">Monthly Activity</h3>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Legend iconType="circle" fontSize={12} wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="gave" name="You Gave" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="took" name="You Took" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {stats?.balanceHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[2rem] border border-border/10 dark:border-white/5 bg-card/40 dark:bg-black/40 backdrop-blur-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-cyan-400" />
                            <h3 className="font-bold text-lg text-foreground dark:text-white">Net Balance Trend</h3>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.balanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(date) => {
                                            const d = new Date(date);
                                            return `${d.getDate()}/${d.getMonth() + 1}`;
                                        }}
                                        minTickGap={30}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#fff" />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* People List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-[2.5rem] border border-border/10 dark:border-white/5 bg-card/30 dark:bg-black/20 backdrop-blur-xl overflow-hidden p-6 sm:p-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">Contacts</h2>
                        <p className="text-sm text-slate-400 mt-1">People involved in your personal ledger transactions</p>
                    </div>
                    <div className="relative flex-1 max-w-sm group">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                            <Input
                                placeholder="Search by name or phone..."
                                className="pl-11 rounded-2xl bg-muted/20 dark:bg-white/5 border-border/10 dark:border-white/10 focus:border-cyan-500/50 text-foreground dark:text-white placeholder:text-muted-foreground h-12 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] border border-dashed border-border/20 dark:border-white/10 bg-muted/10 dark:bg-white/5">
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium text-foreground dark:text-white">
                                {searchTerm ? "No contacts found." : "Your khatabook is empty."}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {searchTerm ? "Try a different search term." : "Start by adding a new transaction entry."}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-3"
                        >
                            <AnimatePresence>
                                {filteredContacts.map((c) => (
                                    <motion.div key={c.contactPhone} variants={item} layout>
                                        <Link
                                            href={`/customer/personal-ledger/${c.contactPhone}`}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-card border border-border/10 dark:bg-white/5 dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 gap-4 sm:gap-0"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-border/10 dark:border-white/10 flex items-center justify-center text-foreground dark:text-white text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                                                    {c.contactName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-lg text-foreground dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                            {c.contactName}
                                                        </p>
                                                        {c.isLinked && (
                                                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-blue-500/20">
                                                                Linked
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 group-hover:text-foreground dark:group-hover:text-slate-300 transition-colors">
                                                        <User className="h-3.5 w-3.5" />
                                                        {c.contactPhone}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                                                <div className="text-left sm:text-right">
                                                    <p className={cn(
                                                        "text-xl font-black tracking-tight",
                                                        c.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                                    )}>
                                                        {formatCurrency(Math.abs(c.balance))}
                                                    </p>
                                                    <p className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                                                        c.balance >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'
                                                    )}>
                                                        {c.balance > 0 ? 'You will get' : c.balance < 0 ? 'You will give' : 'Settled'}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground dark:group-hover:text-white group-hover:translate-x-1 transition-all hidden sm:block" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <AddLedgerEntryDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onSuccess={fetchData}
            />
        </div>
    );
}
