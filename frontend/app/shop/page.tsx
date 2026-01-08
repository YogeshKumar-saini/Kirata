'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, PlusCircle, TrendingUp, Sparkles, Zap, ArrowRight, Activity, Clock, CreditCard, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { motion, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShopDashboardSkeleton } from "@/components/shop/dashboard-skeleton";
import { PremiumTilt } from "@/components/ui/PremiumTilt";

interface Analytics {
    revenue: number;
    orders: number;
}

interface Order {
    orderId: string;
    status: string;
    createdAt: string;
    items: unknown;
    totalAmount: number;
}

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
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            bounce: 0.3
        }
    }
};

export default function ShopDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("Welcome back");

    useEffect(() => {
        fetchDashboardData();

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch today's analytics
            const analyticsRes = await api.get('/analytics/my/today');
            setAnalytics(analyticsRes.data);

            // Fetch recent orders
            const ordersRes = await api.get('/orders/shop/my');
            setRecentOrders((ordersRes.data || []).slice(0, 5));
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return <ShopDashboardSkeleton />;
    }

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto p-2">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 relative"
            >
                {/* Background decorative glow */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

                <div className="space-y-4 relative z-10 w-full lg:w-auto">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold tracking-tight text-foreground dark:text-white mb-2">
                            {greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-400 animate-gradient-x block sm:inline">{Users?.name}</span>
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-lg max-w-lg leading-relaxed">
                            Your shop is running smoothly. Here&apos;s your executive summary for today.
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
                >
                    <Button asChild size="lg" className="rounded-2xl h-12 sm:h-14 px-8 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all duration-300 text-base sm:text-lg font-semibold w-full sm:w-auto">
                        <Link href="/shop/ledger/new">
                            <PlusCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                            New Sale
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-2xl h-12 sm:h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md hover:scale-105 transition-all duration-300 text-base sm:text-lg font-semibold w-full sm:w-auto">
                        <Link href="/shop/products/new">
                            <Package className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                            Add Product
                        </Link>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Bento Grid Layout - Enhanced with PremiumTilt */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] perspective-[2000px]"
            >
                {/* Revenue Card - Large emphasis */}
                <div className="md:col-span-2 row-span-1 md:row-span-1 lg:col-span-2 h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <Card className="glass relative group overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-emerald-900/10 h-full transition-all duration-500 hover:border-emerald-500/40 hover:shadow-emerald-500/10 hover:shadow-2xl">
                                {/* Noise Texture */}
                                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                                    <CreditCard className="h-48 w-48 text-emerald-500" />
                                </div>
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />

                                <CardHeader className="relative z-10">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-medium text-emerald-600 dark:text-emerald-400/90 flex items-center gap-2">
                                            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                            Total Revenue Today
                                        </CardTitle>
                                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"> Live</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10 mt-2">
                                    <div className="text-5xl md:text-7xl font-bold text-foreground dark:text-white tracking-tighter mb-4 shadow-black drop-shadow-lg">
                                        ₹{analytics?.revenue?.toLocaleString() || '0'}
                                    </div>
                                    <div className="flex items-center text-sm text-emerald-300 font-medium bg-emerald-500/20 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Updated in real-time
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </PremiumTilt>
                </div>

                {/* Orders Card */}
                <div className="md:col-span-1 h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <Card className="glass relative group overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-blue-900/10 h-full transition-all duration-300 hover:border-blue-500/40">
                                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ShoppingCart className="h-32 w-32 text-blue-500" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 shimmer" />
                                        Orders Processed
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-foreground dark:text-white tracking-tight mb-2">
                                        {recentOrders.length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Sales transactions today</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </PremiumTilt>
                </div>

                {/* Pending Actions Card */}
                <div className="md:col-span-1 h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <Card className="glass relative group overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-amber-900/10 h-full transition-all duration-300 hover:border-amber-500/40">
                                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity className="h-32 w-32 text-amber-500" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${recentOrders.some(o => o.status === 'PENDING') ? 'bg-amber-500 animate-ping' : 'bg-muted'}`} />
                                        Pending
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-foreground dark:text-white tracking-tight mb-2">
                                        {recentOrders.filter(o => o.status === 'PENDING').length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Orders needing attention</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </PremiumTilt>
                </div>

                {/* Recent Activity Feed - Tall Item */}
                <div className="lg:col-span-3 lg:row-span-2 h-full">
                    <motion.div variants={item} className="h-full">
                        <Card className="glass h-full border-border/40 hover:border-border/60 bg-gradient-to-b from-white to-white/90 dark:from-card dark:to-background flex flex-col backdrop-blur-xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 dark:border-white/5 pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        Live Activity Feed
                                    </CardTitle>
                                    <CardDescription>Real-time updates of shop operations</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-white transition-colors border-white/10 rounded-full px-4">
                                    <Link href="/shop/orders" className="flex items-center gap-2">
                                        View All Orders <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden relative">
                                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.2))] pointer-events-none" />
                                <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-2">
                                    {recentOrders.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground">
                                            <div className="h-20 w-20 bg-muted/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                <Package className="h-10 w-10 opacity-30" />
                                            </div>
                                            <p className="text-lg font-medium">No activity yet today</p>
                                            <p className="text-sm opacity-60">Ready to record your first sale?</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 p-2">
                                            {recentOrders.map((order, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={order.orderId}
                                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border border-border/40 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] hover:bg-white/60 dark:hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-300 cursor-pointer backdrop-blur-sm gap-3 sm:gap-0"
                                                    onClick={() => window.location.href = `/shop/orders/${order.orderId}`}
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg transition-transform group-hover:scale-110 ${order.status === 'COMPLETED' ? 'bg-gradient-to-br from-green-500/20 to-green-900/20 text-green-500' :
                                                            order.status === 'PENDING' ? 'bg-gradient-to-br from-amber-500/20 to-amber-900/20 text-amber-500' :
                                                                'bg-gradient-to-br from-slate-500/20 to-slate-900/20 text-slate-400'
                                                            }`}>
                                                            {order.status === 'COMPLETED' ? '✓' : order.status === 'PENDING' ? '!' : '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                                <span className="font-semibold text-foreground dark:text-white group-hover:text-primary transition-colors text-sm sm:text-base">Order #{order.orderId.slice(-6).toUpperCase()}</span>
                                                                <Badge variant="secondary" className={`text-[10px] h-5 px-2 rounded-full border-0 ${order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                                                                    order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                                                                    }`}>
                                                                    {order.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="h-3 w-3" /> {formatDate(order.createdAt)}</span>
                                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                                <span className="truncate max-w-[120px] sm:max-w-none">Unknown Customer</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                                                        <div className="text-right">
                                                            <p className="font-bold text-base sm:text-lg text-foreground dark:text-white">₹{order.totalAmount ? Number(order.totalAmount).toFixed(0) : '0'}</p>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Analytics Shortcut */}
                <div className="lg:col-span-1 h-full">
                    <PremiumTilt className="h-full">
                        <motion.div variants={item} className="h-full">
                            <Link href="/shop/analytics" className="block h-full group">
                                <Card className="glass h-full border-purple-500/20 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-purple-950/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all hover:scale-[1.02] hover:border-purple-500/40 cursor-pointer flex flex-col items-center justify-center p-6 text-center">
                                    <div className="h-16 w-16 rounded-3xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-purple-500/10 ">
                                        <BarChart3 className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors">Analytics</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Deep dive into trends</p>
                                </Card>
                            </Link>
                        </motion.div>
                    </PremiumTilt>
                </div>

                {/* Common Actions Grid */}
                <div className="lg:col-span-1 h-full">
                    <motion.div variants={item} className="h-full">
                        <div className="grid grid-rows-2 h-full gap-4">
                            <Link href="/shop/customers" className="block h-full group">
                                <div className="h-full">
                                    <PremiumTilt className="h-full">
                                        <Card className="glass h-full border-pink-500/20 bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-pink-950/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-all hover:translate-x-1 cursor-pointer flex items-center px-6 gap-4">
                                            <div className="h-10 w-10 rounded-full bg-pink-500/10 dark:bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Users className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground dark:text-white">Customers</h4>
                                                <p className="text-xs text-muted-foreground">Manage list</p>
                                            </div>
                                        </Card>
                                    </PremiumTilt>
                                </div>
                            </Link>
                            <Link href="/shop/settings" className="block h-full group">
                                <div className="h-full">
                                    <PremiumTilt className="h-full">
                                        <Card className="glass h-full border-gray-500/20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/20 dark:to-gray-900/10 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all hover:translate-x-1 cursor-pointer flex items-center px-6 gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-500/10 dark:bg-gray-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground dark:text-white">Payments</h4>
                                                <p className="text-xs text-muted-foreground">Setup methods</p>
                                            </div>
                                        </Card>
                                    </PremiumTilt>
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                </div>

            </motion.div>
        </div>
    );
}

// Ensure .glass class is globally available in globals.css
