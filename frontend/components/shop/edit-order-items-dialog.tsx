"use client";

import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    total?: number;
}

interface EditOrderItemsDialogProps {
    orderId: string;
    initialItems: OrderItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    isAcceptMode?: boolean;
}

export function EditOrderItemsDialog({ orderId, initialItems, open, onOpenChange, onSuccess, isAcceptMode }: EditOrderItemsDialogProps) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setItems(initialItems.map(item => ({ ...item })));
        }
    }, [open, initialItems]);

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, price: 0 }]);
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
                description: "Please add at least one item to the order.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put(`/orders/${orderId}`, {
                items: validItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price)
                })),
                status: isAcceptMode ? 'ACCEPTED' : undefined
            });

            toast({
                title: isAcceptMode ? "Order Accepted" : "Order Updated",
                description: isAcceptMode
                    ? "Order has been accepted with updated prices successfully."
                    : "Order items and prices have been updated successfully.",
            });

            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: isAcceptMode ? "Acceptance Failed" : "Update Failed",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).response?.data?.message || "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isAcceptMode ? "Accept Order & Verify Prices" : "Edit Order Items"}</DialogTitle>
                        <DialogDescription>
                            {isAcceptMode
                                ? "Please verify and update the actual prices of the items before accepting this order."
                                : "Update item names, quantities, and prices for this order."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-12 gap-2 mb-2 px-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-6">Item Name</div>
                            <div className="col-span-2 text-right">Qty</div>
                            <div className="col-span-3 text-right">Price (₹)</div>
                            <div className="col-span-1"></div>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <Input
                                            placeholder="Item name"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.price}
                                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1">
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
                            Add Item
                        </Button>

                        <div className="flex justify-end pt-4 border-t">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground uppercase">New Total</p>
                                <p className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</p>
                            </div>
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
                                    Saving...
                                </>
                            ) : (
                                isAcceptMode ? "Accept Order" : "Update Order"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
