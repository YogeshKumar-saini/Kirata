"use client";

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { OrdersSkeleton } from "@/components/customer/orders-skeleton";
import { Button } from "@/components/ui/button";
import api from '@/lib/api';
import { Loader2, Package, Clock, CheckCircle, XCircle, Search, ShoppingBag, Store, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types/orders';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumTilt } from "@/components/ui/PremiumTilt";

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/customers/orders');
                await new Promise(resolve => setTimeout(resolve, 600));
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4" />;
            case 'ACCEPTED': return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'READY': return <Package className="h-4 w-4" />;
            case 'COLLECTED': return <CheckCircle className="h-4 w-4" />;
            case 'CANCELLED': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusStyles = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20';
            case 'ACCEPTED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20';
            case 'READY': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20';
            case 'COLLECTED': return 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusGradient = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'from-yellow-500/20 via-orange-500/5 to-transparent';
            case 'ACCEPTED': return 'from-blue-500/20 via-cyan-500/5 to-transparent';
            case 'READY': return 'from-emerald-500/20 via-green-500/5 to-transparent';
            case 'COLLECTED': return 'from-slate-500/20 via-gray-500/5 to-transparent';
            case 'CANCELLED': return 'from-red-500/20 via-pink-500/5 to-transparent';
            default: return 'from-slate-500/20 via-gray-500/5 to-transparent';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.shop?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeOrders = filteredOrders.filter(o => ['PENDING', 'ACCEPTED', 'READY'].includes(o.status));
    const pastOrders = filteredOrders.filter(o => ['COLLECTED', 'CANCELLED'].includes(o.status));

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        show: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 50, damping: 10 } as const
        }
    };

    const OrderCard = ({ order }: { order: Order }) => {
        const items = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
        const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

        // Calculate progress for active orders
        const getProgress = (status: OrderStatus) => {
            switch (status) {
                case 'PENDING': return 25;
                case 'ACCEPTED': return 50;
                case 'READY': return 75;
                case 'COLLECTED': return 100;
                default: return 0;
            }
        };

        return (
            <PremiumTilt className="h-full">
                <motion.div variants={item} layout className="h-full">
                    <Link href={`/customer/orders/${order.orderId}`} className="block group h-full">
                        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/10 dark:border-white/10 bg-gradient-to-br from-card to-transparent dark:from-black/60 dark:to-black/30 backdrop-blur-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 h-full flex flex-col">

                            {/* Status Gradient Background */}
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.15] group-hover:opacity-25 transition-opacity duration-500", getStatusGradient(order.status))} />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                            <div className="relative p-6 px-7 flex flex-col h-full flex-1">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-border/10 dark:border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            <Store className="h-7 w-7 text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-indigo-400 transition-colors">
                                                {order.shop?.name || 'Unknown Shop'}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-400">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="opacity-50">•</span>
                                                <span>
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 border transition-colors flex items-center gap-1.5",
                                        getStatusStyles(order.status)
                                    )}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </Badge>
                                </div>

                                {/* Active Order Timeline Line */}
                                {['PENDING', 'ACCEPTED', 'READY', 'COLLECTED'].includes(order.status) && (
                                    <div className="mb-6 px-1">
                                        <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${getProgress(order.status)}%` }}
                                                className={cn("h-full rounded-full shadow-lg", order.status === 'READY' ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500")}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Sent</span>
                                            <span>Accepted</span>
                                            <span>Ready</span>
                                        </div>
                                    </div>
                                )}

                                {/* Items Preview */}
                                <div className="mb-4 mt-auto p-4 rounded-xl bg-muted/20 dark:bg-black/20 border border-border/5 dark:border-white/5 group-hover:bg-muted/30 dark:group-hover:bg-black/30 transition-colors">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="bg-white/5 p-2 rounded-lg">
                                            <Package className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0 font-medium">
                                            <span className="text-foreground dark:text-white font-bold">{itemCount} items</span>
                                            <span className="text-slate-500 mx-2">•</span>
                                            <span className="truncate opacity-80">
                                                {items.slice(0, 2).map(i => i.name).join(', ')}
                                                {items.length > 2 && ` +${items.length - 2}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-end justify-between pt-2">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Total Amount</div>
                                        <div className="text-2xl font-black bg-gradient-to-r from-foreground to-muted-foreground dark:from-white dark:to-slate-400 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-300 dark:group-hover:to-purple-300 transition-all">
                                            {formatCurrency(order.totalAmount)}
                                        </div>
                                    </div>

                                    <div className="h-10 w-10 rounded-full bg-muted/20 dark:bg-white/5 flex items-center justify-center border border-border/5 dark:border-white/5 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </PremiumTilt>
        );
    };

    if (loading) {
        return <OrdersSkeleton />;
    }

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto p-2 sm:p-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] p-8 sm:p-12 overflow-hidden shadow-2xl shadow-indigo-500/20"
            >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-6">
                        {/* Custom Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-indigo-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5">
                            <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <span className="text-white font-bold">My Orders</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                    <ShoppingBag className="h-5 w-5 text-indigo-200" />
                                </div>
                                <span className="text-indigo-200 font-semibold tracking-wider text-sm uppercase">Purchase History</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 leading-tight">
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 animate-gradient-x">Orders</span>
                            </h1>
                            <p className="text-indigo-200/80 text-lg md:text-xl font-light max-w-lg">
                                Track your active deliveries and review your past purchases.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/50 group-focus-within:text-white transition-colors" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-11 h-12 bg-white/5 backdrop-blur-md border border-indigo-200/20 text-white placeholder:text-indigo-200/30 rounded-2xl focus-visible:ring-0 focus-visible:border-white/40 hover:bg-white/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-border/10 dark:border-white/10 p-1.5 rounded-full h-auto shadow-xl">
                        <TabsTrigger
                            value="active"
                            className="rounded-full px-8 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                        >
                            Active Orders
                            {activeOrders.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5 rounded-full text-[10px] bg-white/20 text-white border-0 shadow-sm">
                                    {activeOrders.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="rounded-full px-8 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                        >
                            Order History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="mt-0 min-h-[400px]">
                    {activeOrders.length > 0 ? (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 perspective-[2000px]"
                        >
                            <AnimatePresence mode="popLayout">
                                {activeOrders.map((order) => (
                                    <OrderCard key={order.orderId} order={order} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-6 rounded-[3rem] border border-dashed border-white/10 bg-white/5 backdrop-blur-xl"
                        >
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                                <ShoppingBag className="h-10 w-10 text-indigo-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">No Active Orders</h2>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    You don&apos;t have any active orders right now.
                                </p>
                            </div>
                            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-500/20" asChild>
                                <Link href="/customer/shops/discover">Start Shopping</Link>
                            </Button>
                        </motion.div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-0 min-h-[400px]">
                    {pastOrders.length > 0 ? (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 perspective-[2000px]"
                        >
                            <AnimatePresence mode="popLayout">
                                {pastOrders.map((order) => (
                                    <OrderCard key={order.orderId} order={order} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-6 rounded-[3rem] border border-dashed border-border/10 dark:border-white/10 bg-muted/20 dark:bg-white/5 backdrop-blur-xl"
                        >
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                                <Clock className="h-10 w-10 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">No Order History</h2>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Your completed and cancelled orders will appear here.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
