'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Phone, MapPin, CheckCircle, XCircle, Package, Edit2, Clock, User, FileText, Receipt, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { EditOrderItemsDialog } from "@/components/shop/edit-order-items-dialog";
import { VerifyPriceDialog } from "@/components/shop/verify-price-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface OrderItem {
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    orderId: string;
    customer: {
        name: string;
        phone: string;
        address: string;
    };
    items: OrderItem[];
    status: 'PENDING' | 'ACCEPTED' | 'READY' | 'COLLECTED' | 'CANCELLED';
    createdAt: string;
    totalAmount: number;
    discount: number;
    offerId?: string;
    deliveryCharge?: number;
    priceVerified?: boolean;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const queryClient = useQueryClient();

    const [updating, setUpdating] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const { toast } = useToast();

    const { data: order, isLoading: loading, error } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await api.get(`/orders/${orderId}`);
            const data = res.data;
            if (!Array.isArray(data.items)) {
                data.items = Object.values(data.items || {});
            }
            return data as Order;
        },
        refetchInterval: 5000,
        enabled: !!orderId,
    });

    const updateStatus = async (status: string) => {
        try {
            setUpdating(true);
            await api.patch(`/orders/${orderId}/status`, { status });
            toast({
                title: "Status Updated",
                description: `Order is now ${status}.${status === 'COLLECTED' ? ' Sale recorded in ledger.' : ''}`,
            });
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.message || 'Failed to update status';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground animate-pulse">Retrieving order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <PageHeader
                    title="Error"
                    showBackButton={true}
                    breadcrumbs={[
                        { label: "Dashboard", href: "/shop" },
                        { label: "Orders", href: "/shop/orders" },
                        { label: "Order Error" }
                    ]}
                />
                <EmptyState
                    icon={FileText}
                    title="Order Not Found"
                    description="We couldn't find the order you're looking for. It might have been deleted or the ID is incorrect."
                    actionLabel="Return to Orders"
                    onAction={() => window.location.href = "/shop/orders"}
                    className="border-dashed"
                />
            </div>
        );
    }

    const subTotal = Number(order.totalAmount) + Number(order.discount || 0) - Number(order.deliveryCharge || 0);
    const hasManualItems = order.items.some(i => !i.productId);

    // Status colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-500';
            case 'ACCEPTED': return 'bg-blue-500';
            case 'READY': return 'bg-purple-500';
            case 'COLLECTED': return 'bg-emerald-500';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pb-20">
            <PageHeader
                title="Order Details"
                description={`Invoice #${order.orderId.toUpperCase()}`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Orders", href: "/shop/orders" },
                    { label: `Order ID: ${order.orderId.substring(0, 8)}...` },
                ]}
                showBackButton={true}
                actions={
                    <div className="flex gap-2">
                        {['PENDING', 'ACCEPTED'].includes(order.status) && (
                            <Button variant="outline" size="sm" className="rounded-full border-border/50" onClick={() => setIsEditDialogOpen(true)}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Edit Items
                            </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-full border-border/50" onClick={() => window.print()}>
                            <Printer className="mr-2 h-3.5 w-3.5" />
                            Print Invoice
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Invoice Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <div className="relative rounded-3xl overflow-hidden bg-card border border-border/50 shadow-2xl">
                        {/* Status Banner */}
                        <div className={`h-2 w-full ${getStatusColor(order.status)}`} />

                        <div className="p-6 md:p-8 space-y-8">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-dashed border-border/50 pb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">INVOICE</h1>
                                        <StatusBadge status={order.status} size="md" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-mono">#{order.orderId.toUpperCase()}</p>
                                </div>
                                <div className="flex flex-col md:items-end gap-1 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{format(new Date(order.createdAt), 'PPP')}</span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {format(new Date(order.createdAt), 'p')}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" /> Bill To
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-lg text-foreground">{order.customer?.name || 'Walk-in Customer'}</p>
                                        {order.customer?.phone && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Phone className="h-3 w-3" /> {order.customer.phone}
                                            </p>
                                        )}
                                        {order.customer?.address && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-3 w-3" /> {order.customer.address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {order.status === 'COLLECTED' && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Receipt className="h-3.5 w-3.5" /> Payment
                                        </h3>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-lg text-emerald-500">Paid & Collected</p>
                                            <p className="text-sm text-muted-foreground">Recorded in Ledger</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="rounded-xl border border-border/40 overflow-hidden">
                                <div className="bg-muted/30 p-3 grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                                    <div className="col-span-6">Item</div>
                                    <div className="col-span-2 text-right">Qty</div>
                                    <div className="col-span-2 text-right">Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                </div>
                                <div className="divide-y divide-border/40">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="p-4 grid grid-cols-12 gap-4 text-sm items-center hover:bg-muted/10 transition-colors text-foreground">
                                            <div className="col-span-6 font-medium">{item.name}</div>
                                            <div className="col-span-2 text-right text-muted-foreground">x{item.quantity}</div>
                                            <div className="col-span-2 text-right text-muted-foreground">₹{Number(item.price).toFixed(2)}</div>
                                            <div className="col-span-2 text-right font-semibold">₹{Number(item.total).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="flex justify-end">
                                <div className="w-full md:w-1/2 space-y-3 pt-4">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>₹{subTotal.toFixed(2)}</span>
                                    </div>

                                    {Number(order.discount) > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-500">
                                            <span>Discount</span>
                                            <span>-₹{Number(order.discount).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {Number(order.deliveryCharge) > 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Delivery Fee</span>
                                            <span>+₹{Number(order.deliveryCharge).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="h-px bg-border my-2 border-dashed" />

                                    <div className="flex justify-between items-end text-foreground">
                                        <span className="text-base font-semibold">Grand Total</span>
                                        <span className="text-2xl font-bold tracking-tight">₹{Number(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Decoration */}
                        <div className="h-3 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)] mt-4 border-t border-border/50" />
                    </div>
                </motion.div>

                {/* Sidebar Actions */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="sticky top-24 space-y-6">
                        <Card className="glass border-border/40 bg-card/40 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    Order Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {order.status === 'PENDING' && (
                                    <>
                                        {!order.priceVerified && hasManualItems ? (
                                            <Button
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
                                                onClick={() => setIsVerifyDialogOpen(true)}
                                                disabled={updating}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" /> Verify Prices
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                                onClick={() => updateStatus('ACCEPTED')}
                                                disabled={updating}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" /> Accept Order
                                            </Button>
                                        )}
                                        <Button
                                            className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10"
                                            variant="outline"
                                            onClick={() => updateStatus('CANCELLED')}
                                            disabled={updating}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Reject Order
                                        </Button>
                                    </>
                                )}

                                {order.status === 'ACCEPTED' && (
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                                        onClick={() => updateStatus('READY')}
                                        disabled={updating}
                                    >
                                        <Package className="mr-2 h-4 w-4" /> Mark Ready for Pickup
                                    </Button>
                                )}

                                {order.status === 'READY' && (
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                        onClick={() => updateStatus('COLLECTED')}
                                        disabled={updating}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Collected & Paid
                                    </Button>
                                )}

                                {['COLLECTED', 'CANCELLED'].includes(order.status) && (
                                    <div className="p-4 rounded-xl bg-muted/30 text-center text-sm text-muted-foreground border border-border/40">
                                        No further actions available for this order.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-transparent p-6 border border-primary/10">
                            <h4 className="font-semibold text-primary mb-2">Need Help?</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                If you need to contact the customer about this order, their phone number is available above.
                            </p>
                            {order.customer?.phone && (
                                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                                    <Phone className="mr-2 h-4 w-4" /> Call Customer
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <EditOrderItemsDialog
                orderId={orderId}
                initialItems={order.items}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["order", orderId] })}
            />
            <VerifyPriceDialog
                order={order}
                open={isVerifyDialogOpen}
                onOpenChange={setIsVerifyDialogOpen}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["order", orderId] })}
            />
        </div>
    );
}
