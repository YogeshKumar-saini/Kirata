"use client";

import React, { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Loader2, ArrowLeft, Search, Download, ArrowDownLeft, ArrowUpRight, Wallet, FileText, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReceiptDialog } from '@/components/ledger/receipt-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumTilt } from '@/components/ui/PremiumTilt';

interface Transaction {
    saleId: string;
    amount: string;
    paymentType: 'CASH' | 'UPI' | 'UDHAAR';
    createdAt: string;
    notes?: string;
    shop: {
        name: string;
        city: string;
    };
}

export default function CustomerGlobalLedgerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('ALL');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customers/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesFilter = paymentFilter === 'ALL' || t.paymentType === paymentFilter;
        return matchesSearch && matchesFilter;
    });

    const totalSpent = filteredTransactions
        .filter(t => t.paymentType !== 'UDHAAR')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalUdhaar = filteredTransactions
        .filter(t => t.paymentType === 'UDHAAR')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
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
                className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 dark:from-[#1e1b4b] dark:via-[#312e81] dark:to-[#0f172a] p-8 sm:p-10 overflow-hidden shadow-2xl shadow-indigo-500/20"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <Link href="/customer">
                            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 border border-white/5">
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-indigo-500/20">
                                    <Wallet className="h-5 w-5 text-indigo-300" />
                                </div>
                                <span className="text-indigo-200 font-semibold tracking-wider text-sm uppercase">Financial Overview</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                Transaction <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 animate-gradient-x">History</span>
                            </h1>
                            <p className="text-indigo-200/80 text-lg mt-3 max-w-2xl font-light">
                                Track all your purchases, payments, and credit history across all shops in one unified view.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <PremiumTilt>
                            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] border border-white/20 dark:border-white/10 shadow-xl min-w-[180px]">
                                <p className="text-xs text-indigo-300 uppercase tracking-wider font-bold mb-1">Total Spent</p>
                                <p className="text-2xl font-black text-white">{formatCurrency(totalSpent)}</p>
                            </div>
                        </PremiumTilt>

                        <PremiumTilt>
                            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] border border-white/20 dark:border-white/10 shadow-xl min-w-[180px]">
                                <p className="text-xs text-red-300 uppercase tracking-wider font-bold mb-1">Outstanding Credit</p>
                                <p className="text-2xl font-black text-red-400">{formatCurrency(totalUdhaar)}</p>
                            </div>
                        </PremiumTilt>
                    </div>
                </div>
            </motion.div>

            {/* Filters & Content */}
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-4 sticky top-4 z-40"
                >
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-card/80 dark:bg-black/60 backdrop-blur-xl border border-border/10 dark:border-white/10 rounded-2xl shadow-lg p-1">
                            <Search className="h-5 w-5 text-muted-foreground ml-4" />
                            <Input
                                placeholder="Search by shop name, city, or notes..."
                                className="pl-4 border-0 bg-transparent focus-visible:ring-0 text-foreground dark:text-white placeholder:text-muted-foreground h-12"
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger className="w-full md:w-[200px] h-14 rounded-2xl bg-card/80 dark:bg-black/60 backdrop-blur-xl border-border/10 dark:border-white/10 text-foreground dark:text-white hover:bg-muted/20 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-indigo-400" />
                                    <SelectValue placeholder="All Payments" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Transactions</SelectItem>
                                <SelectItem value="UDHAAR">Udhaar (Credit)</SelectItem>
                                <SelectItem value="CASH">Cash Payment</SelectItem>
                                <SelectItem value="UPI">UPI Payment</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-card/80 dark:bg-black/60 backdrop-blur-xl border-border/10 dark:border-white/10 text-foreground dark:text-white hover:bg-muted/20 dark:hover:bg-white/10 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                </motion.div>

                <div className="rounded-[2.5rem] border border-border/10 dark:border-white/5 bg-card/40 dark:bg-black/20 backdrop-blur-xl overflow-hidden min-h-[400px] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

                    <CardContent className="p-4 sm:p-6 relative z-10">
                        {filteredTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                <div className="p-8 bg-muted/20 dark:bg-white/5 rounded-full border border-border/10 dark:border-white/10 shadow-2xl">
                                    <Wallet className="h-16 w-16 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">No transactions found</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto">We couldn&apos;t find any transactions matching your current filters. Try adjusting your search.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setPaymentFilter('ALL'); }}
                                    className="border-border/10 dark:border-white/10 hover:bg-muted/20 dark:hover:bg-white/5 text-indigo-500 dark:text-indigo-300"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredTransactions.map((t) => (
                                        <motion.div
                                            key={t.saleId}
                                            variants={item}
                                            layout
                                            className="group relative overflow-hidden rounded-2xl bg-card border border-border/10 dark:bg-white/5 dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/10 hover:border-indigo-500/20 transition-all duration-300 cursor-pointer"
                                            onClick={() => setSelectedTransaction(t)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />

                                            <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div className="flex items-start gap-5">
                                                    <div className={cn(
                                                        "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 border border-border/10 dark:border-white/5",
                                                        t.paymentType === 'UDHAAR'
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-emerald-500/10 text-emerald-500'
                                                    )}>
                                                        {t.paymentType === 'UDHAAR' ? <ArrowDownLeft className="h-7 w-7" /> : <ArrowUpRight className="h-7 w-7" />}
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <h3 className="font-bold text-lg text-foreground dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{t.shop.name}</h3>
                                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 border-border/10 dark:border-white/10 bg-muted/20 dark:bg-white/5 text-muted-foreground">{t.shop.city}</Badge>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span className="font-medium text-foreground dark:text-slate-300">
                                                                {t.paymentType === 'UDHAAR' ? 'Credit Purchase' : `Paid via ${t.paymentType}`}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                                                            <span>{new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                                                            <span>{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>

                                                        {t.notes && (
                                                            <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">
                                                                &quot;{t.notes}&quot;
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-0 sm:min-w-[200px]">
                                                    <div className="text-right">
                                                        <p className={cn(
                                                            "text-xl sm:text-2xl font-black tracking-tight",
                                                            t.paymentType === 'UDHAAR' ? 'text-red-400' : 'text-emerald-400'
                                                        )}>
                                                            {t.paymentType === 'UDHAAR' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                                                        </p>
                                                        <Link
                                                            href={`/customer/shops/${t.saleId.split('-')[0]}`}
                                                            className="text-xs font-medium text-indigo-400/70 hover:text-indigo-300 hover:underline flex items-center justify-end gap-1 mt-1"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            View Shop
                                                            <ArrowUpRight className="h-3 w-3" />
                                                        </Link>
                                                    </div>

                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground group-hover:text-foreground dark:group-hover:text-white group-hover:bg-muted/20 dark:group-hover:bg-white/10 rounded-full transition-all">
                                                        <FileText className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </CardContent>
                </div>
            </div>

            {selectedTransaction && (
                <ReceiptDialog
                    transaction={{
                        ...selectedTransaction,
                        amount: Number(selectedTransaction.amount)
                    }}
                    open={!!selectedTransaction}
                    onOpenChange={(open) => !open && setSelectedTransaction(null)}
                    endpoint={`/customers/transactions/${selectedTransaction.saleId}/receipt`}
                />
            )}
        </div>
    );
}
