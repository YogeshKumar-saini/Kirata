'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, Download, ShoppingBag, Eye, Calendar, Package } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTable, Column } from "@/components/ui/PremiumTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Order {
    id: string; // Required for PremiumTable
    orderId: string;
    customerId: string;
    status: string;
    items: unknown;
    createdAt: string;
    totalAmount?: number;
    customer?: {
        name: string | null;
        phone: string | null;
    };
}

export default function OrdersPage() {
    const { data: orders = [], isLoading: loading } = useQuery({
        queryKey: ['shop-orders'],
        queryFn: async () => {
            const response = await api.get('/orders/shop/my');
            const data = (response.data as unknown[]) || [];
            return data.map((order) => {
                const orderObj = order as Record<string, unknown>;
                return { ...orderObj, id: (order as Order).orderId };
            }) as Order[];
        },
        refetchInterval: 5000,
    });

    const getItemCount = (items: unknown) => {
        if (Array.isArray(items)) return items.length;
        if (typeof items === 'object' && items !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (items as any).items?.length || Object.keys(items).length;
        }
        return 0;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const columns: Column<Order>[] = [
        {
            header: "Order ID",
            accessorKey: "orderId",
            sortable: true,
            cell: (order) => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs text-muted-foreground">#{order.orderId.substring(0, 8).toUpperCase()}</span>
                </div>
            )
        },
        {
            header: "Customer",
            accessorKey: "customer",
            cell: (order) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                            {order.customer?.name ? order.customer.name.slice(0, 2).toUpperCase() : 'WC'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                            {order.customer?.name || "Walk-in Customer"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {order.customer?.phone || "-"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: "Date",
            accessorKey: "createdAt",
            sortable: true,
            cell: (order) => (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.createdAt)}
                </div>
            )
        },
        {
            header: "Items",
            cell: (order) => (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Package className="h-3 w-3" />
                    {getItemCount(order.items)}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            sortable: true,
            cell: (order) => (
                <StatusBadge
                    status={order.status}
                    pulsing={order.status === 'PENDING' || order.status === 'READY'}
                />
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (order) => (
                <div className="flex justify-end">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" title="View Details">
                        <Link href={`/shop/orders/${order.orderId}`}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <PageHeader
                title="Orders"
                description="Track and manage your customer orders."
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Orders" },
                ]}
                actions={
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" asChild className="rounded-full">
                            <Link href="/api/export/orders" target="_blank">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Link>
                        </Button>
                        <Button asChild className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            <Link href="/shop/orders/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Order
                            </Link>
                        </Button>
                    </div>
                }
            />

            <PremiumTable<Order>
                data={orders}
                columns={columns}
                isLoading={loading}
                searchKey="orderId" // Note: Client-side search on orderId, but we might want to enhance search later
                searchPlaceholder="Search orders..."
                filterConfig={{
                    key: "status",
                    label: "Status",
                    options: [
                        { label: "Pending", value: "PENDING" },
                        { label: "Accepted", value: "ACCEPTED" },
                        { label: "Ready", value: "READY" },
                        { label: "Collected", value: "COLLECTED" },
                        { label: "Cancelled", value: "CANCELLED" },
                    ]
                }}
                pagination={true}
                itemsPerPage={10}
                emptyStateConfig={{
                    icon: ShoppingBag,
                    title: "No orders found",
                    description: "You haven't received any orders yet.",
                    actionLabel: "Create Order",
                    onAction: () => document.querySelector<HTMLAnchorElement>('a[href="/shop/orders/new"]')?.click()
                }}
            />
        </div>
    );
}
