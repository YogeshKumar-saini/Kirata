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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { Loader2, Plus, Trash2, MapPin, CreditCard, Banknote, ShoppingBag, Store } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AxiosError } from 'axios';

interface CheckoutDialogProps {
    shopId: string;
    shopName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialItems?: OrderItem[]; // For quick reorder or cart
    mode: 'MANUAL' | 'STORE';
    onSuccess?: () => void;
}

interface OrderItem {
    productId?: string;
    name: string;
    quantity: number;
    price?: number;
}

export function CheckoutDialog({ shopId, shopName, open, onOpenChange, initialItems = [], mode, onSuccess }: CheckoutDialogProps) {
    const [step, setStep] = useState<'REVIEW' | 'PREFERENCES'>('REVIEW');
    const [items, setItems] = useState<OrderItem[]>(mode === 'MANUAL' && initialItems.length === 0 ? [{ name: '', quantity: 1 }] : initialItems);
    const [notes, setNotes] = useState('');
    const [paymentPreference, setPaymentPreference] = useState<'CASH' | 'UPI' | 'UDHAAR'>('CASH');
    const [fulfillmentMethod, setFulfillmentMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const DELIVERY_CHARGE = 39;

    // Reset state when opened
    React.useEffect(() => {
        if (open) {
            setStep('REVIEW');
            setItems(mode === 'MANUAL' && initialItems.length === 0 ? [{ name: '', quantity: 1 }] : initialItems);
            setPaymentPreference('CASH');
            setFulfillmentMethod('PICKUP');
        }
    }, [open, mode, initialItems]);

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1 || mode === 'STORE') {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotalEstimates = () => {
        let total = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
        if (mode === 'STORE' && fulfillmentMethod === 'DELIVERY') {
            total += DELIVERY_CHARGE;
        }
        return total;
    };

    const handleSubmit = async () => {
        // Validation handled before reaching this step ideally, but double check
        const validItems = items.filter(item => item.name.trim() !== '');
        if (validItems.length === 0) return;

        setIsSubmitting(true);
        try {
            await api.post('/orders', {
                shopId,
                items: validItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price ? Number(item.price) : 0
                })),
                notes: notes.trim() || undefined,
                paymentPreference,
                fulfillmentMethod
            });

            toast({
                title: "Order Placed Successfully",
                description: `Your order has been sent to ${shopName}.`,
            });

            onOpenChange(false);
            if (onSuccess) onSuccess();
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

    const renderReviewStep = () => (
        <div className="space-y-4">
            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3">
                {items.length === 0 && mode === 'STORE' && (
                    <div className="text-center py-8 text-muted-foreground">
                        Your cart is empty.
                    </div>
                )}

                {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start group">
                        <div className="flex-1 space-y-1">
                            {mode === 'MANUAL' ? (
                                <Input
                                    placeholder="Item name (e.g. Milk, Bread)"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                // autoFocus={index === items.length - 1}
                                />
                            ) : (
                                <div className="text-sm font-medium pt-2">{item.name}</div>
                            )}
                            {mode === 'STORE' && item.price && (
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(item.price)} x {item.quantity}
                                </div>
                            )}
                        </div>
                        <div className="w-20">
                            {mode === 'MANUAL' ? (
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-10 border rounded-md px-2 text-sm">
                                    {item.quantity}
                                </div>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {mode === 'MANUAL' && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={addItem}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Item
                </Button>
            )}

            {mode === 'STORE' && items.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">Estimated Total</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(calculateTotalEstimates())}</span>
                </div>
            )}
        </div>
    );

    const renderPreferencesStep = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-base font-semibold">How would you like to get your order?</Label>
                <RadioGroup
                    value={fulfillmentMethod}
                    onValueChange={(val: 'PICKUP' | 'DELIVERY') => setFulfillmentMethod(val)}
                    className="grid grid-cols-2 gap-4"
                >
                    <div>
                        <RadioGroupItem value="PICKUP" id="pickup" className="peer sr-only" />
                        <Label
                            htmlFor="pickup"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <Store className="mb-3 h-6 w-6" />
                            Pickup at Shop
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="DELIVERY" id="delivery" className="peer sr-only" />
                        <Label
                            htmlFor="delivery"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <MapPin className="mb-3 h-6 w-6" />
                            Home Delivery
                            <span className="text-xs font-normal text-muted-foreground mt-1">
                                {mode === 'STORE' ? `(+${formatCurrency(DELIVERY_CHARGE)})` : '(Charges applicable)'}
                            </span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
                <Label className="text-base font-semibold">Payment Preference</Label>
                <RadioGroup
                    value={paymentPreference}
                    onValueChange={(val: 'CASH' | 'UPI' | 'UDHAAR') => setPaymentPreference(val)}
                    className="space-y-2"
                >
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <RadioGroupItem value="CASH" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                            <Banknote className="h-4 w-4" />
                            Cash / Pay on Delivery
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <RadioGroupItem value="UPI" id="upi" />
                        <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                            <CreditCard className="h-4 w-4" />
                            Pay via UPI
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md bg-red-50/50">
                        <RadioGroupItem value="UDHAAR" id="udhaar" />
                        <Label htmlFor="udhaar" className="flex items-center gap-2 cursor-pointer flex-1">
                            <ShoppingBag className="h-4 w-4" />
                            Add to My Khata (Udhaar)
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="E.g. Ring the doorbell, leave at gate..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                />
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'REVIEW' ? (mode === 'STORE' ? 'Your Cart' : 'Create Quick List') : 'Order Preferences'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'REVIEW'
                            ? (mode === 'STORE' ? 'Review your items before checkout.' : 'List the items you need. We will price them for you.')
                            : 'Choose how you want to receive and pay for your order.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2 px-1">
                    {step === 'REVIEW' ? renderReviewStep() : renderPreferencesStep()}
                </div>

                <DialogFooter className="pt-2">
                    {step === 'REVIEW' ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button
                                onClick={() => setStep('PREFERENCES')}
                                disabled={items.length === 0 || items.some(i => !i.name.trim())}
                            >
                                Next: Details
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setStep('REVIEW')}>Back</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Place Order {mode === 'STORE' && `(${formatCurrency(calculateTotalEstimates())})`}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
