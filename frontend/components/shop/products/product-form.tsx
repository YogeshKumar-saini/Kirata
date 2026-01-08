'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X, Tag, Package, ImageIcon, IndianRupee, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { SupplierManager } from "../suppliers/supplier-manager";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface Variant {
    name: string;
    price: string;
    stock: string;
    unit: string;
    unitValue: string;
}

interface ProductFormData {
    name: string;
    category: string;
    price: string;
    mrp: string;
    costPrice: string;
    stock: string;
    description: string;
    barcode: string;
    supplierId: string;
    lowStockThreshold: string;
    images: string[];
    variants: Variant[];
}

interface ProductFormProps {
    initialData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    mode: 'create' | 'edit';
    productId?: string;
}

export function ProductForm({ initialData, mode, productId }: ProductFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        category: '',
        price: '',
        mrp: '',
        costPrice: '',
        stock: '',
        description: '',
        barcode: '',
        supplierId: '',
        lowStockThreshold: '10',
        images: [],
        variants: []
    });

    const [imageUrlInput, setImageUrlInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                category: initialData.category || '',
                price: initialData.price?.toString() || '',
                mrp: initialData.mrp?.toString() || '',
                costPrice: initialData.costPrice?.toString() || '',
                stock: initialData.stock?.toString() || '',
                description: initialData.description || '',
                barcode: initialData.barcode || '',
                supplierId: initialData.supplierId || '',
                lowStockThreshold: initialData.lowStockThreshold?.toString() || '10',
                images: Array.isArray(initialData.images) ? initialData.images : [],
                variants: initialData.variants?.map((v: Record<string, unknown>) => ({
                    name: v.name,
                    price: v.price?.toString(),
                    stock: v.stock?.toString(),
                    unit: v.unit || '',
                    unitValue: v.unitValue?.toString() || ''
                })) || []
            });
        }
    }, [initialData]);

    const handleAddImage = () => {
        if (imageUrlInput.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, imageUrlInput.trim()]
            }));
            setImageUrlInput('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { name: '', price: '', stock: '', unit: '', unitValue: '' }]
        }));
    };

    const handleRemoveVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                name: formData.name,
                category: formData.category || undefined,
                price: parseFloat(formData.price),
                mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                stock: parseInt(formData.stock),
                description: formData.description || undefined,
                barcode: formData.barcode || undefined,
                supplierId: formData.supplierId || undefined,
                lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
                images: formData.images,
                variants: formData.variants.filter(v => v.name).map(v => ({
                    name: v.name,
                    price: parseFloat(v.price) || 0,
                    stock: parseInt(v.stock) || 0,
                    unit: v.unit || undefined,
                    unitValue: v.unitValue ? parseFloat(v.unitValue) : undefined
                }))
            };

            if (mode === 'create') {
                await api.post('/products', payload);
                // alert('Product created successfully!'); // Replaced with implicit success via redirect
            } else {
                await api.patch(`/products/${productId}`, payload);
                // alert('Product updated successfully!');
            }
            router.push('/shop/products');
        } catch (error) {
            console.error('Failed to save product:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((error as any).response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card className="glass border-sidebar-border/50 shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-primary" />
                                Basic Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-background/50"
                                    placeholder="e.g. Masala Tea 250g"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="bg-background/50"
                                        placeholder="e.g. Beverages"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Supplier</Label>
                                    <SupplierManager
                                        value={formData.supplierId}
                                        onChange={id => setFormData({ ...formData, supplierId: id })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-background/50 min-h-[100px]"
                                    placeholder="Product details..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-sidebar-border/50 shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                Product Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter Image URL (http://...)"
                                    value={imageUrlInput}
                                    onChange={e => setImageUrlInput(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Button type="button" onClick={handleAddImage} variant="secondary">Add</Button>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                <AnimatePresence>
                                    {formData.images.map((url, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            key={idx}
                                            className="relative aspect-square border-2 border-dashed border-border/50 rounded-lg overflow-hidden bg-muted/20 group hover:border-primary/50 transition-colors"
                                        >
                                            <Image src={url} alt={`Product ${idx}`} fill className="object-cover" unoptimized />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 bg-destructive/90 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {formData.images.length === 0 && (
                                    <div className="col-span-4 flex flex-col items-center justify-center h-24 border-2 border-dashed border-border/50 rounded-lg text-muted-foreground bg-muted/10">
                                        <ImageIcon className="h-6 w-6 mb-2 opacity-50" />
                                        <p className="text-xs">No images added</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="glass border-sidebar-border/50 shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IndianRupee className="h-4 w-4 text-primary" />
                                Pricing & Inventory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Selling Price (₹) *</Label>
                                    <Input
                                        type="number"
                                        id="price"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="bg-background/50 font-medium"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mrp">MRP (₹)</Label>
                                    <Input
                                        type="number"
                                        id="mrp"
                                        value={formData.mrp}
                                        onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                        className="bg-background/50 text-muted-foreground"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="costPrice">Cost Price (₹)</Label>
                                <Input
                                    type="number"
                                    id="costPrice"
                                    value={formData.costPrice}
                                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                    placeholder="For profit calculation"
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Current Stock *</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            id="stock"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                            className="bg-background/50 pl-9"
                                        />
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lowStock">Low Stock Alert</Label>
                                    <Input
                                        type="number"
                                        id="lowStock"
                                        value={formData.lowStockThreshold}
                                        onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode / SKU</Label>
                                <Input
                                    id="barcode"
                                    value={formData.barcode}
                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                    className="bg-background/50"
                                    placeholder="Enter or scan barcode"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-sidebar-border/50 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Layers className="h-4 w-4 text-primary" />
                                Variants
                            </CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={handleAddVariant} className="h-8">
                                <Plus className="mr-2 h-3 w-3" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AnimatePresence>
                                {formData.variants.map((variant, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        key={idx}
                                        className="flex gap-2 items-start border p-3 rounded-lg bg-muted/30 relative group"
                                    >
                                        <div className="grid grid-cols-2 gap-2 flex-1">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Name</Label>
                                                <Input
                                                    value={variant.name}
                                                    onChange={e => handleVariantChange(idx, 'name', e.target.value)}
                                                    placeholder="Color/Size"
                                                    className="h-8 text-sm bg-background/50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Price</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                                                    className="h-8 text-sm bg-background/50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Stock</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={e => handleVariantChange(idx, 'stock', e.target.value)}
                                                    className="h-8 text-sm bg-background/50"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive h-6 w-6 absolute -top-2 -right-2 bg-background rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => handleRemoveVariant(idx)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {formData.variants.length === 0 && (
                                <div className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg bg-muted/10">
                                    No variants added yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border/50 sticky bottom-0 bg-background/80 backdrop-blur-md p-4 -mx-4 sm:mx-0 z-10">
                <Button variant="ghost" asChild>
                    <Link href="/shop/products">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving} className="shadow-lg shadow-primary/20 min-w-[150px]">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Product' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
