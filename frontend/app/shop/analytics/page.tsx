'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, ShoppingCart, BarChart3, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

import api from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface AnalyticsData {
    totalRevenue: number;
    totalProfit: number; // Added profit
    totalOrders: number;
    totalViews: number;
    averageOrderValue: number;
    dailyData: {
        date: string;
        views: number;
        orders: number;
        revenue: number;
        profit: number; // Added profit
    }[];
    topCustomers: {
        id: string | null;
        name: string;
        phone: string;
        totalSpent: number;
        orderCount: number;
    }[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        totalViews: 0,
        averageOrderValue: 0,
        dailyData: [],
        topCustomers: []
    });
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30'); // Date range state

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await api.get(`/analytics/my?days=${dateRange}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        }
    }, [dateRange]);

    useEffect(() => {
        const load = async () => {
            await fetchAnalytics();
        };
        load();
    }, [fetchAnalytics]);

    // Format daily data for charts
    const chartData = data.dailyData.map(d => ({
        name: format(new Date(d.date), 'EEE'),
        fullDate: format(new Date(d.date), 'MMM dd'),
        revenue: Number(d.revenue),
        profit: Number(d.profit || 0),
        orders: d.orders
    }));

    const orderStatusData = [
        { name: 'Completed', value: data.totalOrders, color: '#10b981' },
        { name: 'Pending', value: 0, color: '#f59e0b' },
        { name: 'Cancelled', value: 0, color: '#ef4444' },
    ];
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8 p-1 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 dark:from-white dark:to-white/60"
                    >
                        Analytics
                    </motion.h1>
                    <p className="text-muted-foreground text-base md:text-lg">
                        Deep dive into your store&apos;s performance.
                    </p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
                >
                    <div className="flex bg-muted/20 p-1 rounded-lg border border-white/5">
                        {['7', '30', '90'].map((days) => (
                            <Button
                                key={days}
                                variant={dateRange === days ? "secondary" : "ghost"}
                                size="sm"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setDateRange(days as any)}
                                className={dateRange === days ? "bg-white text-black shadow-sm" : "hover:bg-white/5"}
                            >
                                {days} Days
                            </Button>
                        ))}
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 flex-1 md:flex-none justify-center">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </motion.div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="glass relative overflow-hidden border-emerald-500/20 bg-emerald-500/5 group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign className="h-24 w-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-500/80">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
                                ₹{data.totalRevenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium bg-muted/10 w-fit px-2 py-1 rounded">
                                Last {dateRange} Days
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="glass relative overflow-hidden border-teal-500/20 bg-teal-500/5 group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign className="h-24 w-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-teal-600 dark:text-teal-500/80">Net Profit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
                                ₹{data.totalProfit.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium bg-muted/10 w-fit px-2 py-1 rounded">
                                {(data.totalRevenue > 0 ? (data.totalProfit / data.totalRevenue * 100).toFixed(1) : 0)}% Margin
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>


                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass relative overflow-hidden border-blue-500/20 bg-blue-500/5 group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShoppingCart className="h-24 w-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-500/80">Total Orders</CardTitle>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
                                {data.totalOrders}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium bg-muted/10 w-fit px-2 py-1 rounded">
                                Completed
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="glass relative overflow-hidden border-purple-500/20 bg-purple-500/5 group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 className="h-24 w-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-500/80">Avg. Value</CardTitle>
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
                                ₹{Math.round(data.averageOrderValue).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium bg-muted/10 w-fit px-2 py-1 rounded">
                                Per Order
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Chart Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-2"
                >
                    <Card className="glass border-border/40 dark:border-white/5 bg-card/40 h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Revenue & Profit
                            </CardTitle>
                            <CardDescription>Financial performance over the last {dateRange} days</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[350px] w-full pt-4 pr-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="rgba(255,255,255,0.3)"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.3)"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₹${value}`}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#aaa' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="profit"
                                            name="Profit"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorProfit)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className=""
                >
                    <Card className="glass border-border/40 dark:border-white/5 bg-card/40 h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-500" />
                                Order Status
                            </CardTitle>
                            <CardDescription>Distribution across statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold">0</span>
                                    <span className="text-xs text-muted-foreground">Total</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {orderStatusData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                        <span className="font-semibold ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Top Customers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card className="glass border-border/40 dark:border-white/5 bg-gradient-to-br from-card/30 to-card/10">
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription>Highest spending customers in this period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topCustomers?.length > 0 ? (
                                data.topCustomers.map((customer, i) => (
                                    <div key={customer.id || i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.orderCount} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">₹{customer.totalSpent.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No customer data available for this period.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
