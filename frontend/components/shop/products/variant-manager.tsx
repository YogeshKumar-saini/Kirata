'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Package } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Variant {
    variantId: string;
    name: string;
    sku?: string;
    price: number;
    mrp?: number;
    costPrice?: number;
    stock: number;
    unit?: string;
    unitValue?: number;
    isActive: boolean;
}

interface VariantManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
    onSuccess?: () => void;
}

export function VariantManager({ open, onOpenChange, productId, productName, onSuccess }: VariantManagerProps) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        mrp: '',
        costPrice: '',
        stock: '',
        unit: '',
        unitValue: ''
    });

    const fetchVariants = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}/variants`);
            setVariants(response.data || []);
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to load variants',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [productId, toast]);

    useEffect(() => {
        if (open && productId) {
            fetchVariants();
        }
    }, [open, productId, fetchVariants]);

    const resetForm = () => {
        setFormData({
            name: '',
            sku: '',
            price: '',
            mrp: '',
            costPrice: '',
            stock: '',
            unit: '',
            unitValue: ''
        });
        setEditingVariant(null);
        setShowForm(false);
    };

    const handleEdit = (variant: Variant) => {
        setEditingVariant(variant);
        setFormData({
            name: variant.name,
            sku: variant.sku || '',
            price: variant.price.toString(),
            mrp: variant.mrp?.toString() || '',
            costPrice: variant.costPrice?.toString() || '',
            stock: variant.stock.toString(),
            unit: variant.unit || '',
            unitValue: variant.unitValue?.toString() || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.stock) {
            toast({
                title: 'Validation Error',
                description: 'Name, price, and stock are required',
                variant: 'destructive'
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: formData.name,
                sku: formData.sku || undefined,
                price: parseFloat(formData.price),
                mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                stock: parseInt(formData.stock),
                unit: formData.unit || undefined,
                unitValue: formData.unitValue ? parseFloat(formData.unitValue) : undefined
            };

            if (editingVariant) {
                await api.patch(`/products/variants/${editingVariant.variantId}`, payload);
                toast({
                    title: 'Success',
                    description: 'Variant updated successfully'
                });
            } else {
                await api.post(`/products/${productId}/variants`, payload);
                toast({
                    title: 'Success',
                    description: 'Variant created successfully'
                });
            }

            resetForm();
            fetchVariants();
            onSuccess?.();
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to save variant',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteVariantId) return;

        try {
            setLoading(true);
            await api.delete(`/products/variants/${deleteVariantId}`);
            toast({
                title: 'Success',
                description: 'Variant deleted successfully'
            });
            setDeleteVariantId(null);
            fetchVariants();
            onSuccess?.();
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: 'Error',
                description: err.response?.data?.error || 'Failed to delete variant',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Manage Variants - {productName}
                        </DialogTitle>
                        <DialogDescription>
                            Add and manage product variants with different prices and stock levels.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Add Variant Button */}
                        {!showForm && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="w-full"
                                variant="outline"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Variant
                            </Button>
                        )}

                        {/* Variant Form */}
                        <AnimatePresence>
                            {showForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4 p-4 border rounded-lg bg-card/40"
                                >
                                    <h3 className="font-semibold text-sm">
                                        {editingVariant ? 'Edit Variant' : 'New Variant'}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g., Large, Red, 500ml"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled={loading}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sku">SKU</Label>
                                            <Input
                                                id="sku"
                                                placeholder="Optional"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (₹) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                disabled={loading}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mrp">MRP (₹)</Label>
                                            <Input
                                                id="mrp"
                                                type="number"
                                                step="0.01"
                                                placeholder="Optional"
                                                value={formData.mrp}
                                                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="costPrice">Cost Price (₹)</Label>
                                            <Input
                                                id="costPrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="Optional"
                                                value={formData.costPrice}
                                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="stock">Stock *</Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                placeholder="0"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                disabled={loading}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="unit">Unit</Label>
                                            <Input
                                                id="unit"
                                                placeholder="e.g., kg, ml, pcs"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="unitValue">Unit Value</Label>
                                            <Input
                                                id="unitValue"
                                                type="number"
                                                step="0.01"
                                                placeholder="e.g., 500"
                                                value={formData.unitValue}
                                                onChange={(e) => setFormData({ ...formData, unitValue: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {editingVariant ? 'Update' : 'Create'} Variant
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetForm}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Variants List */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">Existing Variants ({variants.length})</h3>

                            {loading && variants.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : variants.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No variants yet. Add your first variant above.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {variants.map((variant) => (
                                        <motion.div
                                            key={variant.variantId}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center justify-between p-3 border rounded-lg bg-card/20 hover:bg-card/40 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{variant.name}</span>
                                                    {variant.sku && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {variant.sku}
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant={variant.stock > 0 ? 'default' : 'destructive'}
                                                        className="text-xs"
                                                    >
                                                        Stock: {variant.stock}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Price: ₹{variant.price}
                                                    {variant.mrp && ` | MRP: ₹${variant.mrp}`}
                                                    {variant.unit && variant.unitValue && ` | ${variant.unitValue}${variant.unit}`}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(variant)}
                                                    disabled={loading}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setDeleteVariantId(variant.variantId)}
                                                    disabled={loading}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteVariantId} onOpenChange={() => setDeleteVariantId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this variant. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
