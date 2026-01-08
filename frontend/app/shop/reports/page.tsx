'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar as CalendarIcon, Share2, TrendingUp, CreditCard, Mail, BarChart3 } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { motion } from "framer-motion";

interface DashboardData {
    summary: {
        totalRevenue: number;
        totalTransactions: number;
        averageValue: number;
    };
    revenueTrend: Array<{ date: string; amount: number }>;
    paymentMix: Array<{ name: string; value: number }>;
}

export default function ReportsPage() {
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(false);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Mock data for initial render to look good without real data
            if (process.env.NODE_ENV === 'development' && false) {
                setDashboardData({
                    summary: { totalRevenue: 15430, totalTransactions: 45, averageValue: 342 },
                    revenueTrend: Array.from({ length: 7 }, (_, i) => ({ date: `2024-01-0${i + 1}`, amount: Math.floor(Math.random() * 5000) + 1000 })),
                    paymentMix: [{ name: 'Cash', value: 60 }, { name: 'UPI', value: 40 }]
                });
                setDashboardLoading(false);
                return;
            }

            try {
                setDashboardLoading(true);
                const response = await api.get(`/reports/dashboard?timeframe=${timeframe}`);
                setDashboardData(response.data);
            } catch (err: unknown) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setDashboardLoading(false);
            }
        };
        fetchDashboardData();
    }, [timeframe]);


    const handleGenerateReport = async () => {
        if (!date) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const params = new URLSearchParams({ timeframe, date: date.toISOString() });
            const response = await api.get(`/reports/generate?${params.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-report-${timeframe}-${format(date, 'yyyy-MM-dd')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: unknown) {
            console.error('Failed to generate report:', err);
            setError('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailReport = async () => {
        if (!date) return;
        setLoading(true);
        setError(null);
        try {
            await api.post('/reports/email', { timeframe, date: date.toISOString() });
            setSuccess('Report sent successfully!');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to email report:', err);
            setError(err.response?.data?.message || 'Failed to email report.');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b']; // Violet, Sky, Emerald, Amber

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8 pb-20 p-1"
        >
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Analytics Hub
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">
                        Deep insights into your shop&apos;s performance.
                    </p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-fit self-start xl:self-auto">
                    {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={cn(
                                "px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                                timeframe === t ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {dashboardLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Analyzing data...</p>
                </div>
            ) : dashboardData ? (
                <>
                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
                        <Card className="glass border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                                <span className="text-indigo-400">₹</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₹{dashboardData.summary.totalRevenue.toLocaleString('en-IN')}</div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">+12%</span> vs last period
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                                <BarChart3 className="h-4 w-4 text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{dashboardData.summary.totalTransactions}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total completed orders</p>
                            </CardContent>
                        </Card>
                        <Card className="glass border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
                                <CreditCard className="h-4 w-4 text-amber-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₹{Math.round(dashboardData.summary.averageValue).toLocaleString('en-IN')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Per transaction avg.</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Charts */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <motion.div variants={itemVariants} className="md:col-span-2">
                            <Card className="glass border-white/5 h-[400px] flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                                    <CardDescription>Daily financial performance</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dashboardData.revenueTrend}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => {
                                                    const d = new Date(str);
                                                    return `${d.getDate()}/${d.getMonth() + 1}`;
                                                }}
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `₹${value}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value: number | undefined) => value !== undefined ? [`₹${value.toLocaleString('en-IN')}`, 'Revenue'] : ['N/A', 'Revenue']}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="glass border-white/5 h-[400px] flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">Payment Mix</CardTitle>
                                    <CardDescription>Method distribution</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.paymentMix}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {dashboardData.paymentMix.map((entry: unknown, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(value: number | undefined) => value !== undefined ? [`₹${value.toLocaleString('en-IN')}`] : ['N/A']} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </>
            ) : null}

            {/* Export Section */}
            <motion.div variants={itemVariants}>
                <Card className="glass border-white/5 bg-card/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-primary" /> Reports & Exports
                        </CardTitle>
                        <CardDescription>Generate and download detailed reports for accounting.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-muted-foreground">For Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                                    <Button
                                        className="flex-1 bg-primary hover:bg-primary/90"
                                        onClick={handleGenerateReport}
                                        disabled={loading || !date}
                                    >
                                        {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                                        {loading ? 'Processing' : 'Download PDF'}
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 sm:flex-none border-white/10 hover:bg-white/5"
                                            onClick={handleEmailReport}
                                            disabled={loading || !date}
                                        >
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 sm:flex-none border-green-500/20 text-green-500 hover:bg-green-500/10"
                                            onClick={() => {
                                                if (!date) return;
                                                const formattedDate = format(date, 'dd MMM yyyy');
                                                const text = `Here is the sales report for ${formattedDate}.`;
                                                const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                                                window.open(url, '_blank');
                                            }}
                                            disabled={!date}
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {(error || success) && (
                                <div className={cn("text-sm p-3 rounded-lg border", error ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400")}>
                                    {error || success}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
