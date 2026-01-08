'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Offer {
    offerId: string;
    code: string;
    type: string;
    value: number;
    description?: string;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validTo?: string;
}

interface OfferFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    offer?: Offer | null; // Optional offer for editing
}

export function OfferForm({ open, onOpenChange, onSuccess, offer }: OfferFormProps) {
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE', // PERCENTAGE | FLAT
        value: '',
        description: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        validTo: ''
    });

    // Initialize form data when offer changes
    useEffect(() => {
        if (offer) {
            setFormData({
                code: offer.code,
                type: offer.type,
                value: offer.value.toString(),
                description: offer.description || '',
                minOrderValue: offer.minOrderValue?.toString() || '',
                maxDiscount: offer.maxDiscount?.toString() || '',
                usageLimit: offer.usageLimit?.toString() || '',
                validTo: offer.validTo ? new Date(offer.validTo).toISOString().slice(0, 16) : ''
            });
        } else {
            // Reset for create mode
            setFormData({
                code: '',
                type: 'PERCENTAGE',
                value: '',
                description: '',
                minOrderValue: '',
                maxDiscount: '',
                usageLimit: '',
                validTo: ''
            });
        }
    }, [offer, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Payload Prep
            const payload = {
                code: formData.code.toUpperCase(),
                type: formData.type,
                value: parseFloat(formData.value),
                description: formData.description,
                minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
                validTo: formData.validTo ? new Date(formData.validTo).toISOString() : undefined
            };

            if (offer) {
                // Update existing offer
                await api.patch(`/offers/${offer.offerId}`, payload);
            } else {
                // Create new offer
                await api.post('/offers', payload);
            }

            // Reset & Close
            setFormData({
                code: '',
                type: 'PERCENTAGE',
                value: '',
                description: '',
                minOrderValue: '',
                maxDiscount: '',
                usageLimit: '',
                validTo: ''
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((error as any).response?.data?.message || `Failed to ${offer ? 'update' : 'create'} offer`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{offer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
                    <DialogDescription>
                        {offer ? 'Update the discount coupon details.' : 'Create a discount coupon for your customers.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Coupon Code *</Label>
                            <Input
                                id="code"
                                placeholder="e.g. SAVE20"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Discount Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={val => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                    <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="value">Discount Value * {formData.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</Label>
                        <Input
                            id="value"
                            type="number"
                            min="0"
                            placeholder={formData.type === 'PERCENTAGE' ? "20" : "100"}
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minOrder">Min Order Value (₹)</Label>
                            <Input
                                id="minOrder"
                                type="number"
                                min="0"
                                placeholder="Optional"
                                value={formData.minOrderValue}
                                onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                            <Input
                                id="maxDiscount"
                                type="number"
                                min="0"
                                placeholder="Optional"
                                disabled={formData.type === 'FLAT'} // Not relevant for flat
                                value={formData.maxDiscount}
                                onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="usageLimit">Usage Limit (Count)</Label>
                            <Input
                                id="usageLimit"
                                type="number"
                                min="1"
                                placeholder="Optional (e.g. 100)"
                                value={formData.usageLimit}
                                onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="validTo">Valid Until</Label>
                        <Input
                            id="validTo"
                            type="datetime-local"
                            value={formData.validTo}
                            onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Internal notes or customer facing details"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full mt-2">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {offer ? 'Update Offer' : 'Create Offer'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
