"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface RecordPaymentDialogProps {
    shopId: string;
    shopName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function RecordPaymentDialog({ shopId, shopName, open, onOpenChange, onSuccess }: RecordPaymentDialogProps) {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid amount greater than zero.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/customers/shops/${shopId}/payments`, {
                amount: numAmount,
                paymentMethod,
                notes: notes.trim() || undefined,
            });

            toast({
                title: "Payment Recorded",
                description: `Your payment of ₹${numAmount} has been logged.`,
            });

            // Reset form
            setAmount('');
            setNotes('');
            setPaymentMethod('CASH');
            onOpenChange(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to Record Payment",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).response?.data?.message || "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Record Payment to {shopName}</DialogTitle>
                        <DialogDescription>
                            Enter details of the payment you&apos;ve made to this shop.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium">
                                Amount (₹)
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="paymentMethod" className="text-sm font-medium">
                                Payment Method
                            </label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI / Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="text-sm font-medium">
                                {paymentMethod === 'UPI' ? 'Transaction ID / Reference (Optional)' : 'Notes (Optional)'}
                            </label>
                            <Input
                                id="transactionId"
                                placeholder={paymentMethod === 'UPI' ? 'e.g. 1234567890...' : 'e.g. Paid at counter...'}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                "Record Payment"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
