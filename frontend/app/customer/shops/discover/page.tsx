"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { Loader2, MapPin, Store, Search, Star, ShoppingBag, Sparkles, Filter, Clock, Navigation, History, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PlaceOrderDialog } from '@/components/customer/place-order-dialog';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Shop {
    shopId: string;
    name: string;
    photoUrl: string | null;
    addressLine1: string | null;
    city: string | null;
    category: string;
    averageRating?: number;
    totalReviews?: number;
    // Enhanced props
    distance?: number;
    isOpen?: boolean;
}

export default function DiscoverShopsPage() {
    const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [selectedShop, setSelectedShop] = useState<{ id: string, name: string } | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecentSearches, setShowRecentSearches] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('kirata_recent_searches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const saveRecentSearch = (term: string) => {
        if (!term.trim()) return;
        const newSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newSearches);
        localStorage.setItem('kirata_recent_searches', JSON.stringify(newSearches));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('kirata_recent_searches');
    };

    const fetchShops = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory !== 'ALL') params.append('category', selectedCategory);

            const res = await api.get(`/shops/search?${params.toString()}`);

            // Augment with mock data for demo purposes since API doesn't return these yet
            const augmentedData = res.data.map((shop: Shop) => ({
                ...shop,
                distance: parseFloat((Math.random() * 5 + 0.1).toFixed(1)), // Mock distance 0.1-5.1 km
                isOpen: Math.random() > 0.2 // 80% chance open
            }));

            setFilteredShops(augmentedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) saveRecentSearch(searchQuery);
            fetchShops();
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, fetchShops]);

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
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        show: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 50, damping: 10 }
        }
    };

    const navItems = [
        { label: 'Dashboard', href: '/customer' },
        { label: 'My Shops', href: '/customer/shops' },
        { label: 'Discover', active: true }
    ];

    if (loading && !filteredShops.length) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto p-2 sm:p-4">
            {/* Hero Section with Integrated Breadcrumbs */}
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
                            {navItems.map((nav, idx) => (
                                <React.Fragment key={nav.label}>
                                    {idx > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                                    {nav.active ? (
                                        <span className="text-white font-bold">{nav.label}</span>
                                    ) : (
                                        <Link href={nav.href || '#'} className="hover:text-white transition-colors">
                                            {nav.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                    <Sparkles className="h-5 w-5 text-indigo-200" />
                                </div>
                                <span className="text-indigo-200 font-semibold tracking-wider text-sm uppercase">Explore</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 leading-tight">
                                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 animate-gradient-x">Shops</span>
                            </h1>
                            <p className="text-indigo-200/80 text-lg md:text-xl font-light max-w-lg leading-relaxed">
                                Find new favorite stores in your neighborhood and start ordering instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filter & Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-4 z-40"
            >
                <div className="bg-background/80 dark:bg-black/80 backdrop-blur-xl border border-border/10 dark:border-white/10 p-4 rounded-3xl flex flex-col sm:flex-row gap-4 shadow-xl ring-1 ring-black/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search shops by name, city, or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowRecentSearches(true)}
                            onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                            className="pl-12 bg-muted/50 dark:bg-white/5 border-transparent focus:bg-background h-12 rounded-2xl text-base transition-all shadow-inner"
                        />

                        {/* Recent Searches Dropdown */}
                        <AnimatePresence>
                            {showRecentSearches && recentSearches.length > 0 && !searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl p-2 overflow-hidden z-50"
                                >
                                    <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><History className="h-3 w-3" /> Recent Activity</span>
                                        <button onClick={clearRecentSearches} className="hover:text-destructive transition-colors">Clear All</button>
                                    </div>
                                    {recentSearches.map(term => (
                                        <button
                                            key={term}
                                            onMouseDown={() => setSearchQuery(term)}
                                            className="w-full text-left px-4 py-3 hover:bg-muted/50 rounded-xl flex items-center justify-between group transition-colors"
                                        >
                                            <span className="text-sm font-medium">{term}</span>
                                            <Search className="h-3 w-3 opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[220px] bg-muted/50 dark:bg-white/5 border-transparent h-12 rounded-2xl font-medium">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/10 shadow-xl">
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="GROCERY">Grocery</SelectItem>
                            <SelectItem value="MEDICAL">Medical</SelectItem>
                            <SelectItem value="HARDWARE">Hardware</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Shops Grid */}
            {filteredShops.length === 0 && !loading ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center p-20 text-center rounded-[3rem] border border-dashed border-border/20 bg-muted/20"
                >
                    <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                        <Store className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No Shops Found</h2>
                    <p className="text-muted-foreground">Try adjusting your search terms or category filter.</p>
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredShops.map((shop) => (
                            <PremiumTilt key={shop.shopId} className="h-full">
                                <motion.div variants={item} layout className="h-full">
                                    <div className="relative flex flex-col h-full rounded-[2rem] overflow-hidden border border-border/10 dark:border-white/10 bg-card dark:bg-zinc-900/80 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/30 group">

                                        {/* Image Section */}
                                        <div className="relative h-52 w-full overflow-hidden">
                                            {shop.photoUrl ? (
                                                <Image
                                                    src={shop.photoUrl}
                                                    alt={shop.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-zinc-900">
                                                    <Store className="h-16 w-16 text-muted-foreground/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                            {/* Top Badges */}
                                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                                <Badge className={cn(
                                                    "backdrop-blur-md border-white/10 px-2.5 py-1 text-xs font-bold shadow-lg",
                                                    shop.isOpen ? "bg-emerald-500/80 text-white" : "bg-zinc-900/80 text-zinc-400"
                                                )}>
                                                    <Clock className="w-3 h-3 mr-1.5" />
                                                    {shop.isOpen ? 'Open Now' : 'Closed'}
                                                </Badge>

                                                <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                                                    <Filter className="w-3 h-3 text-indigo-400" />
                                                    {shop.category}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-1 p-5 relative">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{shop.name}</h3>
                                                    {shop.averageRating !== undefined && shop.averageRating > 0 && (
                                                        <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">{shop.averageRating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                                                        <Navigation className="h-3 w-3 shrink-0 text-indigo-500" />
                                                        <span className="font-medium text-foreground/80">{shop.distance} km away</span>
                                                        <span className="text-border mx-1">•</span>
                                                        <span className="line-clamp-1">{shop.city || 'Local'}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">
                                                        {shop.addressLine1 || 'Visit store for more details.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-border/5 flex gap-2">
                                                <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs border-border/20 hover:bg-muted font-medium" asChild>
                                                    <Link href={`/customer/shops/${shop.shopId}`}>
                                                        View Details
                                                    </Link>
                                                </Button>
                                                <Button
                                                    className="flex-1 rounded-xl h-10 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold"
                                                    disabled={!shop.isOpen}
                                                    onClick={() => {
                                                        setSelectedShop({ id: shop.shopId, name: shop.name });
                                                        setOrderDialogOpen(true);
                                                    }}
                                                >
                                                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                                                    {shop.isOpen ? 'Order' : 'Closed'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </PremiumTilt>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Place Order Dialog */}
            {selectedShop && (
                <PlaceOrderDialog
                    shopId={selectedShop.id}
                    shopName={selectedShop.name}
                    open={orderDialogOpen}
                    onOpenChange={setOrderDialogOpen}
                />
            )}
        </div>
    );
}

