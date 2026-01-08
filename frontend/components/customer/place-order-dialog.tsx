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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AxiosError } from 'axios';

interface PlaceOrderDialogProps {
    shopId: string;
    shopName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface OrderItem {
    name: string;
    quantity: number;
    price?: number;
}

export function PlaceOrderDialog({ shopId, shopName, open, onOpenChange, onSuccess }: PlaceOrderDialogProps) {
    const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1 }]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty items
        const validItems = items.filter(item => item.name.trim() !== '');
        if (validItems.length === 0) {
            toast({
                variant: "destructive",
                title: "Empty Order",
                description: "Please add at least one item to your order.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/orders', {
                shopId,
                items: validItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: 0 // Price will be set by shopkeeper
                })),
                notes: notes.trim() || undefined,
            });

            toast({
                title: "Order Placed Successfully",
                description: `Your order for ${validItems.length} items has been sent to ${shopName}.`,
            });

            // Reset form
            setItems([{ name: '', quantity: 1 }]);
            setNotes('');
            onOpenChange(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string; errors?: { field: string; message: string }[] }>;
            const errorData = axiosError.response?.data;
            const errorMessage = errorData?.message || "Please try again later.";
            const validationErrors = errorData?.errors?.map((e) => `${e.field}: ${e.message}`).join('\n');

            toast({
                variant: "destructive",
                title: "Failed to Place Order",
                description: validationErrors ? `${errorMessage}\n${validationErrors}` : errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Place Order at {shopName}</DialogTitle>
                        <DialogDescription>
                            List the items you want to order. The shopkeeper will review and update the prices.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Item name (e.g. Milk, Bread)"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            required={index === 0}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={addItem}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another Item
                        </Button>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="text-sm font-medium">
                                Delivery Notes / Instructions (Optional)
                            </label>
                            <Textarea
                                id="notes"
                                placeholder="Any special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
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
                                    Placing Order...
                                </>
                            ) : (
                                "Send Order"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
