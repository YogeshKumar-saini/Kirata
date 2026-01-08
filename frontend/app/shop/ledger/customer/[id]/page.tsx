'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, DollarSign, TrendingUp, TrendingDown, Phone,
    Plus, Wallet, History, AlertTriangle, Bell, Pencil, Banknote, QrCode, CreditCard
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { PaymentModal } from "@/components/ledger/payment-modal";
import { CustomerEditDialog } from "@/components/customer/customer-edit-dialog";
import { ReminderDialog } from "@/components/customer/reminder-dialog";
import { Badge } from "@/components/ui/badge";
import { CustomerSkeleton } from "@/components/customer/customer-skeleton";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTable, Column } from "@/components/ui/PremiumTable";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    uniqueId: string;
    notes?: string;
    creditLimit?: number;
    tags?: string[];
}

interface Sale {
    id: string; // Required for PremiumTable
    saleId: string;
    amount: number;
    paymentType: string;
    source: string;
    createdAt: string;
    runningBalance?: number;
}

interface CustomerData {
    customer: Customer | null;
    sales: Sale[];
    customerReportedEntries?: ReportedEntry[];
    summary: {
        totalTransactions: number;
        totalCredit: number;
        totalCash: number;
        totalAmount: number;
        outstandingBalance: number;
    };
}

interface ReportedEntry {
    id: string;
    type: 'GAVE' | 'TOOK';
    amount: number;
    createdAt: string;
}

export default function CustomerLedgerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [customerEditOpen, setCustomerEditOpen] = useState(false);
    const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

    const fetchCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/ledger/customer/${id}/transactions`);
            setData(response.data);
        } catch (err: unknown) {
            console.error('Failed to fetch customer data:', err);
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'Failed to load customer data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-foreground/90">
                    {date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {formatDistanceToNow(date, { addSuffix: true })}
                </span>
            </div>
        );
    };

    const getPaymentBadgeColor = (paymentType: string) => {
        switch (paymentType) {
            case 'CASH':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'UPI':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'UDHAAR':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default:
                return 'bg-secondary text-secondary-foreground border-secondary';
        }
    };

    const calculateRunningBalance = () => {
        if (!data) return [];
        let balance = 0;
        const salesWithBalance = [...data.sales].reverse().map(sale => {
            if (sale.paymentType === 'UDHAAR') {
                balance += Number(sale.amount);
            } else if (sale.paymentType === 'CASH' || sale.paymentType === 'UPI') {
                balance -= Number(sale.amount);
            }
            return { ...sale, id: sale.saleId, runningBalance: balance };
        });
        return salesWithBalance.reverse();
    };

    const handleUpdateCustomer = async (updateData: { name: string; creditLimit: number | null; tags: string[]; notes: string }) => {
        try {
            await api.patch(`/shops/customers/${id}`, updateData);
            fetchCustomerData(); // Refresh data
        } catch (err) {
            console.error('Failed to update customer:', err);
        }
    };

    const salesWithBalance = calculateRunningBalance();

    const columns: Column<Sale>[] = useMemo(() => [
        {
            header: "Date",
            accessorKey: "createdAt",
            cell: (sale) => formatDate(sale.createdAt),
            className: "min-w-[120px]"
        },
        {
            header: "Type",
            accessorKey: "paymentType",
            cell: (sale) => (
                <span className={cn(`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border`, getPaymentBadgeColor(sale.paymentType))}>
                    {sale.paymentType === 'CASH' && <Banknote className="h-3 w-3" />}
                    {sale.paymentType === 'UPI' && <QrCode className="h-3 w-3" />}
                    {sale.paymentType === 'UDHAAR' && <CreditCard className="h-3 w-3" />}
                    {sale.paymentType}
                </span>
            )
        },
        {
            header: "Note",
            accessorKey: "source",
            cell: (sale) => <span className="text-muted-foreground text-sm truncate max-w-[150px] block" title={sale.source}>{sale.source}</span>
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (sale) => (
                <div className={cn("font-bold", sale.paymentType === 'UDHAAR' ? 'text-rose-500' : 'text-emerald-500')}>
                    {sale.paymentType === 'UDHAAR' ? '+' : '-'}₹{Number(sale.amount).toLocaleString()}
                </div>
            ),
            className: "text-right"
        },
        {
            header: "Balance",
            accessorKey: "runningBalance",
            cell: (sale) => (
                <div className="font-mono text-muted-foreground">
                    ₹{Math.abs(sale.runningBalance || 0).toLocaleString()}
                </div>
            ),
            className: "text-right"
        }
    ], []);

    if (loading) {
        return <CustomerSkeleton />;
    }

    if (error || !data || !data.customer) {
        return (
            <div className="flex flex-col gap-6 p-4 justify-center items-center h-[50vh]">
                <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-3xl text-destructive text-center backdrop-blur-md">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Customer Not Found</h2>
                    <p className="mb-6 opacity-80">{error || 'Could not retrieve customer details.'}</p>
                    <Button asChild variant="outline">
                        <Link href="/shop/ledger">Return to Ledger</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8 pb-20 px-1"
        >
            <PageHeader
                title={data.customer.name || 'Unknown Customer'}
                description={
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        {data.customer.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {data.customer.phone}</span>}
                        {data.customer.tags && data.customer.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 text-white/60">{tag}</Badge>
                        ))}
                    </div> as React.ReactNode // Casting to ReactNode for PageHeader description prop
                }
                showBackButton={true}
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Ledger", href: "/shop/ledger" },
                    { label: data.customer.name || "Customer" }
                ]}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setPaymentModalOpen(true)} variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <Wallet className="mr-2 h-4 w-4" />
                            Pay
                        </Button>
                        <Button onClick={() => setReminderDialogOpen(true)} variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                            <Bell className="mr-2 h-4 w-4" />
                            Remind
                        </Button>
                        <Button asChild className="bg-primary shadow-xl shadow-primary/20 hover:bg-primary/90">
                            <Link href={`/shop/ledger/new?customerId=${id}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Sale
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <Card className="glass border-white/5 bg-gradient-to-br from-card/50 to-card/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="h-24 w-24 text-primary" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-4xl font-bold tracking-tight ${data.summary.outstandingBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                ₹{data.summary.outstandingBalance.toLocaleString()}
                            </div>
                            {data.customer.creditLimit && data.customer.creditLimit > 0 && (
                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                        <span>Limit Used</span>
                                        <span>{Math.round((data.summary.outstandingBalance / data.customer.creditLimit) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${(data.summary.outstandingBalance / data.customer.creditLimit) > 0.9 ? 'bg-rose-500' : 'bg-primary'
                                                }`}
                                            style={{ width: `${Math.min((data.summary.outstandingBalance / data.customer.creditLimit) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="glass border-white/5 bg-card/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{data.summary.totalAmount.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="glass border-rose-500/10 bg-rose-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-rose-500/80">Total Credit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-rose-500/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">₹{data.summary.totalCredit.toLocaleString()}</div>
                            <p className="text-xs text-rose-500/50 mt-1">Given over time</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Card className="glass border-emerald-500/10 bg-emerald-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-500/80">Received</CardTitle>
                            <TrendingDown className="h-4 w-4 text-emerald-500/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">₹{data.summary.totalCash.toLocaleString()}</div>
                            <p className="text-xs text-emerald-500/50 mt-1">Repayments</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Transaction List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <PremiumTable<Sale>
                        data={salesWithBalance} // Display newest first
                        columns={columns}
                        isLoading={loading}
                        pagination={true}
                        itemsPerPage={10}
                        emptyStateConfig={{
                            icon: History,
                            title: "No transactions found",
                            description: "This customer has no recorded transaction history."
                        }}
                    />
                </motion.div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Notes */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="glass border-white/5 bg-card/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                                    Notes
                                    <Button variant="ghost" size="icon" onClick={() => setCustomerEditOpen(true)} className="h-6 w-6">
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground/80 italic min-h-[60px] p-3 rounded-lg bg-black/20 border border-white/5">
                                    {data.customer.notes || "No notes added for this customer."}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Report Sync */}
                    {data.customerReportedEntries && data.customerReportedEntries.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <Card className="border-blue-500/20 bg-blue-500/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        Self-Reported
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {data.customerReportedEntries.map((e: ReportedEntry) => (
                                        <div key={e.id} className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <div>
                                                <p className="text-xs font-semibold text-blue-300">
                                                    {e.type === 'GAVE' ? 'They Paid' : 'They Took'}
                                                </p>
                                                <p className="text-[10px] text-blue-400/60">{new Date(e.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <p className="font-bold text-blue-400">₹{e.amount}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {data.customer && (
                <>
                    <PaymentModal
                        open={paymentModalOpen}
                        onOpenChange={setPaymentModalOpen}
                        customerId={data.customer.id}
                        customerName={data.customer.name || 'Customer'}
                        outstandingBalance={data.summary.outstandingBalance}
                        onSuccess={fetchCustomerData}
                    />
                    <CustomerEditDialog
                        open={customerEditOpen}
                        onOpenChange={setCustomerEditOpen}
                        customer={data.customer}
                        onSave={handleUpdateCustomer}
                    />
                    <ReminderDialog
                        open={reminderDialogOpen}
                        onOpenChange={setReminderDialogOpen}
                        customerId={data.customer.id}
                        customerName={data.customer.name || 'Customer'}
                        outstandingBalance={data.summary.outstandingBalance}
                    />
                </>
            )}
        </motion.div>
    );
}
