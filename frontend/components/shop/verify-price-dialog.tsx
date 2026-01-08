"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
    name: string;
    quantity: number;
    price?: number;
}

interface Order {
    orderId: string;
    totalAmount: number;
    items: OrderItem[];
}

interface VerifyPriceDialogProps {
    order: Order;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function VerifyPriceDialog({ order, open, onOpenChange, onSuccess }: VerifyPriceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const items = order?.items || [];
    const hasZeroPrices = items.some((item: OrderItem) => !item.price || item.price <= 0);

    const handleVerify = async () => {
        if (hasZeroPrices) {
            setError('Cannot verify order with zero or missing prices. Please update prices first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`/orders/${order.orderId}/verify-price`);
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.error || 'Failed to verify prices');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Verify Order Prices</DialogTitle>
                    <DialogDescription>
                        Review and confirm the prices for this manual order before accepting it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-2">
                            {items.map((item: OrderItem, index: number) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${!item.price || item.price <= 0 ? 'text-red-600' : ''}`}>
                                            {formatCurrency(item.price || 0)} × {item.quantity}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            = {formatCurrency((item.price || 0) * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className="font-semibold">Total Amount:</span>
                            <span className="text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Warnings */}
                    {hasZeroPrices && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Some items have zero or missing prices. Please update the order before verifying.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!hasZeroPrices && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                All prices look good. Click verify to confirm and enable order acceptance.
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleVerify} disabled={loading || hasZeroPrices}>
                        {loading ? 'Verifying...' : 'Verify Prices'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
