"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShopListSkeleton } from '@/components/customer/shop-list-skeleton';
import api from '@/lib/api';
import { MapPin, Store, ArrowRight, Search, Sparkles, Filter, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PremiumTilt } from "@/components/ui/PremiumTilt";

interface Shop {
    shopId: string;
    name: string;
    photoUrl: string | null;
    addressLine1: string | null;
    city: string | null;
    category: string;
    balance: number;
}

export default function MyShopsPage() {
    const [myShops, setMyShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchShops = async () => {
            try {
                // Fetch only shops where customer has transactions
                const res = await api.get('/customers/shops');
                await new Promise(resolve => setTimeout(resolve, 500)); // Artificial delay for effect
                setMyShops(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Grocery', 'Medical', 'Vegetables', 'Electronics', 'Other'];

    const filteredShops = myShops.filter(shop => {
        const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || shop.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item: Variants = {
        hidden: { y: 30, opacity: 0, scale: 0.9 },
        show: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 50, damping: 10 }
        }
    };

    if (loading) {
        return <ShopListSkeleton />;
    }

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] p-8 sm:p-12 overflow-hidden shadow-2xl shadow-indigo-500/20"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-6">
                        {/* Custom Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-indigo-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5">
                            <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <span className="text-white font-bold">My Shops</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                    <Store className="h-5 w-5 text-indigo-200" />
                                </div>
                                <span className="text-indigo-200 font-semibold tracking-wider text-sm uppercase">Marketplace</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 leading-tight">
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 animate-gradient-x">Shops</span>
                            </h1>
                            <p className="text-indigo-200/80 text-lg md:text-xl font-light max-w-lg">
                                Track your expenses and manage relationships with your favorite local stores.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/50 group-focus-within:text-white transition-colors" />
                            <Input
                                placeholder="Search shops..."
                                className="pl-11 h-12 bg-white/5 backdrop-blur-md border border-indigo-200/20 text-white placeholder:text-indigo-200/30 rounded-2xl focus-visible:ring-0 focus-visible:border-white/40 hover:bg-white/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button className="h-12 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold px-6 shadow-xl shadow-white/5 hover:scale-105 transition-transform" asChild>
                            <Link href="/customer/shops/discover">
                                <Sparkles className="mr-2 h-4 w-4" /> Discover New
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 overflow-x-auto pb-4 scrollbar-none items-center"
            >
                <div className="p-2 bg-muted/50 rounded-full mr-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                            selectedCategory === cat
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25 scale-105"
                                : "bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-white/5 border-border/50 dark:border-white/5 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </motion.div>

            {filteredShops.length === 0 && myShops.length > 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <p className="text-muted-foreground">No shops found matching your search.</p>
                    <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Filters</Button>
                </div>
            ) : myShops.length === 0 ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center space-y-6 rounded-[3rem] border border-dashed border-border/10 dark:border-white/10 bg-muted/20 dark:bg-white/5 backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10 relative z-10 animate-pulse-slow">
                        <Store className="h-10 w-10 text-indigo-400" />
                    </div>
                    <div className="space-y-2 relative z-10">
                        <h2 className="text-3xl font-bold">No Shops Found</h2>
                        <p className="text-muted-foreground max-w-md mx-auto text-lg">
                            You haven&apos;t connected with any shops yet.
                        </p>
                    </div>
                    <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-14 px-8 shadow-xl shadow-indigo-500/20 relative z-10 hover:scale-105 transition-transform" asChild>
                        <Link href="/customer/shops/discover">Find Shops Nearby</Link>
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 perspective-[2000px]"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredShops.map((shop) => (
                            <PremiumTilt key={shop.shopId}>
                                <motion.div variants={item} layout className="h-full">
                                    <Link href={`/customer/shops/${shop.shopId}`} className="block group h-full">
                                        <div className="relative flex flex-col h-full rounded-[2.5rem] overflow-hidden border border-border/10 dark:border-white/10 bg-gradient-to-br from-card to-muted/20 dark:from-black/60 dark:to-black/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/30">

                                            {/* Image Section */}
                                            <div className="relative h-56 w-full overflow-hidden">
                                                {shop.photoUrl ? (
                                                    <Image
                                                        src={shop.photoUrl}
                                                        alt={shop.name}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-black">
                                                        <Store className="h-16 w-16 text-white/10" />
                                                    </div>
                                                )}

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                                                {/* Status Badge */}
                                                <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300 delay-100">
                                                    {shop.balance && shop.balance > 0 ? (
                                                        <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                            Pending
                                                        </div>
                                                    ) : (
                                                        <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            Clear
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex flex-col flex-1 p-6 relative">
                                                <div className="mb-4">
                                                    <h3 className="font-bold text-2xl line-clamp-1 text-foreground dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">{shop.name}</h3>
                                                    <div className="flex items-center text-sm text-slate-400 gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                                                        <span className="line-clamp-1">{shop.city || 'Unknown Location'}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-border/5 dark:border-white/5 flex items-end justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Outstanding Balance</span>
                                                        <span className={cn(
                                                            "font-bold text-2xl tracking-tight",
                                                            shop.balance && shop.balance > 0 ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]" : "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                                                        )}>
                                                            {shop.balance ? `₹${shop.balance}` : '₹0'}
                                                        </span>
                                                    </div>

                                                    <div className="h-10 w-10 rounded-full border border-border/10 dark:border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg">
                                                        <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </PremiumTilt>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
