'use client';

import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Wallet, Users, Edit, ArrowUpRight, ArrowDownLeft, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CustomerEditDialog } from "@/components/shop/customers/customer-edit-dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTable, Column } from "@/components/ui/PremiumTable";
import { motion } from "framer-motion";

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email?: string | null;
    uniqueId: string;
    balance: number;
    creditLimit?: number | null;
    tags?: string[];
    notes?: string | null;
    _count?: {
        orders: number;
        udhaarRecords: number;
    };
}

export default function CustomersPage() {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const { data, isLoading: loading, refetch } = useQuery({
        queryKey: ['shop-customers'],
        queryFn: async () => {
            const response = await api.get('/shop/customers');
            return response.data;
        }
    });

    const customers: Customer[] = data?.customers || [];

    // Derived stats
    const totalCustomers = customers.length;
    const totalDue = customers.reduce((acc, c) => c.balance > 0 ? acc + c.balance : acc, 0);
    const totalAdvance = customers.reduce((acc, c) => c.balance < 0 ? acc + Math.abs(c.balance) : acc, 0);

    const columns: Column<Customer>[] = [
        {
            header: "Customer",
            accessorKey: "name",
            sortable: true,
            cell: (customer) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {(customer.name || '?').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">{customer.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {customer.phone || '-'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: "Balance",
            accessorKey: "balance",
            sortable: true,
            cell: (customer) => (
                <Badge
                    variant="secondary"
                    className={`
                        px-2 py-0.5 rounded-md text-xs font-bold ring-1 ring-inset
                        ${customer.balance > 0
                            ? 'bg-rose-500/10 text-rose-500 ring-rose-500/20'
                            : customer.balance < 0
                                ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20'
                                : 'bg-muted text-muted-foreground ring-border'}
                    `}
                >
                    {customer.balance > 0 ? (
                        <span className="flex items-center gap-1">
                            <ArrowDownLeft className="h-3 w-3" />
                            ₹{customer.balance.toLocaleString()}
                        </span>
                    ) : customer.balance < 0 ? (
                        <span className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            ₹{Math.abs(customer.balance).toLocaleString()}
                        </span>
                    ) : (
                        "Settled"
                    )}
                </Badge>
            )
        },
        {
            header: "Transactions",
            cell: (customer) => (
                <span className="text-sm text-muted-foreground">
                    {(customer._count?.orders || 0) + (customer._count?.udhaarRecords || 0)}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (customer) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setEditDialogOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-8 hover:bg-muted text-xs">
                        <Link href={`/shop/ledger/customer/${customer.id}`}>
                            View Ledger <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8 pb-20">
            <PageHeader
                title="Customers"
                description="Manage your network and track credit effortlessly."
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Customers" },
                ]}
                actions={
                    <Button asChild className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        <Link href="/shop/ledger/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Transaction
                        </Link>
                    </Button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="glass border-primary/10 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Receivables</CardTitle>
                            <TrendingUp className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">₹{totalDue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Pending from customers</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass border-emerald-500/10 bg-emerald-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Advance</CardTitle>
                            <Wallet className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">₹{totalAdvance.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Advance payments held</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="glass border-blue-500/10 bg-blue-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{totalCustomers}</div>
                            <p className="text-xs text-muted-foreground mt-1">In your network</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <PremiumTable
                data={customers}
                columns={columns}
                isLoading={loading}
                searchKey="name"
                searchPlaceholder="Search customers..."
                pagination={true}
                itemsPerPage={10}
                emptyStateConfig={{
                    icon: Users,
                    title: "No customers found",
                    description: "You haven't added any customers yet. Record a transaction to add one.",
                    actionLabel: "New Transaction",
                    onAction: () => document.querySelector<HTMLAnchorElement>('a[href="/shop/ledger/new"]')?.click()
                }}
            />

            {selectedCustomer && (
                <CustomerEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onSuccess={() => {
                        refetch();
                        setEditDialogOpen(false);
                    }}
                    customer={selectedCustomer}
                />
            )}
        </div>
    );
}
