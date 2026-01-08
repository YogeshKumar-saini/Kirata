"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface Summary {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    cashAmount: number;
    upiAmount: number;
    udhaarAmount: number;
    byPaymentType: Record<string, { count: number; amount: number }>;
    topCustomers: { customerId: string; customerName: string; count: number; amount: number }[];
    dailyBreakdown: { date: string; amount: number; count: number }[];
}

interface AdvancedChartsProps {
    summary: Summary | null;
}

const COLORS = {
    CASH: '#10b981',   // Emerald 500
    UPI: '#3b82f6',    // Blue 500
    UDHAAR: '#ef4444', // Red 500
    OTHER: '#8b5cf6'   // Violet 500
};

export function AdvancedCharts({ summary }: AdvancedChartsProps) {
    if (!summary) {
        return <div className="p-8 text-center text-muted-foreground">Loading charts...</div>;
    }

    // Payment Type Data for Pie Chart
    const paymentTypeData = [
        { name: 'Cash', value: summary.cashAmount, color: COLORS.CASH },
        { name: 'UPI', value: summary.upiAmount, color: COLORS.UPI },
        { name: 'Udhaar', value: summary.udhaarAmount, color: COLORS.UDHAAR },
    ].filter(item => item.value > 0);

    // Daily Sales Data for Line Chart
    // Sort logic should ideally be backend, but ensuring order here
    const dailyData = (summary.dailyBreakdown || []).map(day => ({
        date: new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        amount: day.amount,
        count: day.count
    }));

    // Top Customers Data for Bar Chart
    const customerData = (summary.topCustomers || []).slice(0, 5).map(c => ({
        name: c.customerName.length > 15 ? c.customerName.substring(0, 15) + '...' : c.customerName,
        value: c.amount,
        fullValue: c.amount
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Payment Methods Distribution */}
            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Payment Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                    {paymentTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Tooltip formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Revenue']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-sm text-muted-foreground">No data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Daily Sales Trend */}
            <Card className="lg:col-span-2 min-w-0">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Daily Sales Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                    {dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickFormatter={(val) => `₹${val}`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Sales']}
                                    labelStyle={{ color: '#000' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ fill: '#2563eb', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No trend data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Top Customers (Optional, maybe for another row or conditional) */}
            {customerData.length > 0 && (
                <Card className="md:col-span-2 lg:col-span-3 min-w-0">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Top Customers by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Tooltip formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Revenue']} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
