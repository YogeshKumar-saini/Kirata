"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import api from '@/lib/api';
import {
    Loader2,
    Clock,
    Package,
    CheckCircle,
    XCircle,
    Phone,
    MapPin,
    Store,
    Receipt,
    AlertCircle,
    Printer,
    Star,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus } from '@/types/orders';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentButton } from '@/components/customer/payment-button';
import { OrderDetailsSkeleton } from '@/components/customer/order-details-skeleton';
import { motion } from 'framer-motion';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const queryClient = useQueryClient();
    const [cancelling, setCancelling] = useState(false);
    const { toast } = useToast();

    const { data: order, isLoading: loading, error } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await api.get(`/orders/${orderId}`);
            const data = response.data;
            if (!Array.isArray(data.items)) {
                data.items = Object.values(data.items || {});
            }
            return data as Order;
        },
        refetchInterval: 5000,
        enabled: !!orderId,
    });

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setCancelling(true);
        try {
            await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
            toast({
                title: "Order Cancelled",
                description: "Your order has been cancelled successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Please try again later.";
            toast({
                variant: "destructive",
                title: "Failed to Cancel",
                description: message,
            });
        } finally {
            setCancelling(false);
        }
    };

    const getStatusStep = (status: OrderStatus) => {
        const steps = ['PENDING', 'ACCEPTED', 'READY', 'COLLECTED'];
        if (status === 'CANCELLED') return -1;
        return steps.indexOf(status);
    };

    const StatusTimeline = ({ status }: { status: OrderStatus }) => {
        const currentStep = getStatusStep(status);
        const steps = [
            { id: 'PENDING', label: 'Ordered', icon: Clock },
            { id: 'ACCEPTED', label: 'Accepted', icon: Store },
            { id: 'READY', label: 'Ready', icon: Package },
            { id: 'COLLECTED', label: 'Collected', icon: CheckCircle },
        ];

        if (status === 'CANCELLED') {
            return (
                <div className="flex items-center justify-center p-6 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                    <XCircle className="h-6 w-6 mr-3" />
                    <span className="font-bold text-lg">This order has been cancelled.</span>
                </div>
            );
        }

        return (
            <div className="relative flex justify-between w-full mt-6 mb-10 px-4">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-1.5 bg-secondary -z-0 rounded-full" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute top-5 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 -z-0 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {steps.map((step, index) => {
                    const isActive = index <= currentStep;
                    const isCompleted = index < currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10 group">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isActive ? (isCompleted ? '#10b981' : '#3b82f6') : '#1e293b',
                                    borderColor: isActive ? (isCompleted ? '#10b981' : '#3b82f6') : '#334155'
                                }}
                                className={`w-11 h-11 rounded-full flex items-center justify-center border-4 shadow-lg transition-colors duration-300 bg-background`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <span className={`text-xs mt-3 font-medium transition-colors duration-300 uppercase tracking-wider ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return <OrderDetailsSkeleton />;
    }

    if (error || !order) {
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Order not found';
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
                <div className="bg-destructive/10 p-6 rounded-full animate-bounce">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Unable to load order</h2>
                <p className="text-muted-foreground max-w-md text-lg">{errorMessage}</p>
                <Button onClick={() => router.back()} variant="outline" className="rounded-full px-8">Go Back</Button>
            </div>
        );
    }

    const subtotal = Number(order.totalAmount) + (Number(order.discount) || 0) - (Number(order.deliveryCharge) || 0);
    const total = Number(order.totalAmount);
    const isPaid = Array.isArray(order.payments) && order.payments.some(p => p.status === 'SUCCESS');

    return (
        <div className="space-y-8 pb-24 md:pb-12 min-h-screen">
            {/* Immersive Hero Header */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border-b border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-blue-900/40 to-slate-900/80 z-0" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

                {/* Decorative Blurs */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl z-0" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl z-0" />

                <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 md:items-end justify-between">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-indigo-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5 mb-4">
                            <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <Link href="/customer/orders" className="hover:text-white transition-colors">My Orders</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <span className="text-white font-bold">#{order.orderId.slice(-8).toUpperCase()}</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                                <span>Order Details</span>
                                <span className="text-lg md:text-xl font-medium text-indigo-300 font-mono opacity-80">#{order.orderId.slice(-8).toUpperCase()}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-indigo-200 text-sm">
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    <Clock className="h-4 w-4 text-indigo-400" />
                                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${order.status === 'READY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-indigo-300 border-white/10'}`}>
                                    <span className="font-bold uppercase tracking-wider text-xs">{order.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {!isPaid && order.status !== 'CANCELLED' && order.status !== 'COLLECTED' && (
                            <PaymentButton
                                amount={total}
                                shopId={order.shopId}
                                orderId={orderId}
                                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['order', orderId] })}
                            />
                        )}
                        {order.status === 'PENDING' && (
                            <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="rounded-full px-6 shadow-lg shadow-red-900/20"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Cancel Order"
                                )}
                            </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => window.print()} className="rounded-full h-10 w-10 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white" title="Print Invoice">
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Section */}
                    <Card className="overflow-hidden border-border/50 shadow-lg bg-card/40 backdrop-blur-sm">
                        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Package className="h-4 w-4" /> Order Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-10 pb-8 px-6 md:px-10">
                            <StatusTimeline status={order.status} />
                            <div className="text-center mt-8">
                                <p className="text-lg font-medium text-foreground">
                                    {order.status === 'PENDING' && "Waiting for shopkeeper approval"}
                                    {order.status === 'ACCEPTED' && "Your order is being prepared"}
                                    {order.status === 'READY' && "Ready for pickup!"}
                                    {order.status === 'COLLECTED' && "Order completed"}
                                    {order.status === 'CANCELLED' && "Order cancelled"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {order.status === 'PENDING' && "The shopkeeper will review your order shortly."}
                                    {order.status === 'ACCEPTED' && "We'll notify you when it's ready."}
                                    {order.status === 'READY' && "Please visit the shop to collect your items."}
                                    {order.status === 'COLLECTED' && "Thank you for shopping with us!"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Items ({Array.isArray(order.items) ? order.items.length : 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {Array.isArray(order.items) && order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-6 hover:bg-accent/20 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center text-sm font-bold text-foreground border border-border/50 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-base group-hover:text-primary transition-colors">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(Number(item.price || 0))} / unit
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right font-bold text-base">
                                            {formatCurrency(Number(item.total || 0))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Shop Information */}
                    <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-b border-indigo-500/10">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Store className="h-5 w-5 text-indigo-500" />
                                Shop Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                                    {order.shop?.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg leading-tight">{order.shop?.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="line-clamp-2">{order.shop?.city || 'Location unavailable'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button variant="outline" className="w-full bg-background/50 hover:bg-background" asChild>
                                    <a href={`tel:${order.shop?.phone}`}>
                                        <Phone className="mr-2 h-4 w-4 text-emerald-500" />
                                        Call
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full bg-background/50 hover:bg-background" asChild>
                                    <Link href={`/customer/shops/${order.shopId}`}>
                                        <Store className="mr-2 h-4 w-4 text-blue-500" />
                                        Visit
                                    </Link>
                                </Button>
                            </div>

                            {order.status === 'COLLECTED' && (
                                <div className="pt-3 border-t border-border/50">
                                    <Button
                                        variant="default"
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
                                        asChild
                                    >
                                        <Link href={`/customer/shops/${order.shopId}?tab=reviews`}>
                                            <Star className="mr-2 h-4 w-4 fill-white" />
                                            Write a Review
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b border-border/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-emerald-500" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            {Number(order.deliveryCharge || 0) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-medium">{formatCurrency(Number(order.deliveryCharge))}</span>
                                </div>
                            )}
                            {Number(order.discount || 0) > 0 && (
                                <div className="flex justify-between text-sm text-emerald-500 font-medium">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(Number(order.discount))}</span>
                                </div>
                            )}
                            <div className="border-t border-dashed border-border/50 my-2" />
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-lg">Total</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/20 p-4 border-t border-border/50">
                            {isPaid ? (
                                <div className="flex items-center justify-center w-full gap-2 text-emerald-500 font-bold bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                                    <CheckCircle className="h-5 w-5" />
                                    Payment Completed
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full gap-2 text-muted-foreground text-sm font-medium py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Payment Pending
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
