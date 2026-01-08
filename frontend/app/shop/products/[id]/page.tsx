'use client';

import { Loader2, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { ProductForm } from "@/components/shop/products/product-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { motion } from "framer-motion";

interface Product {
    productId: string;
    name: string;
    description?: string;
    price: number;
    mrp?: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    images?: string[];
    barcode?: string;
    supplierId?: string;
    lowStockThreshold?: number;
    variants?: Record<string, unknown>[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    // Safely handle params.id which could be string, string[], or undefined
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (err: unknown) {
                console.error('Failed to fetch product:', err);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const message = (err as any).response?.data?.message || 'Failed to load product';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            await api.delete(`/products/${id}`);
            // Show toast or alert here ideally
            router.push('/shop/products');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.message || 'Failed to delete product';
            alert(message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-muted-foreground mt-4 font-medium animate-pulse">Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 max-w-4xl py-10">
                <PageHeader
                    title="Error"
                    showBackButton={true}
                    breadcrumbs={[
                        { label: "Dashboard", href: "/shop" },
                        { label: "Products", href: "/shop/products" },
                        { label: "Error" },
                    ]}
                />
                <EmptyState
                    icon={AlertCircle}
                    title="Error Loading Product"
                    description={error}
                    actionLabel="Back to Products"
                    onAction={() => router.push('/shop/products')}
                    className="border-destructive/20 bg-destructive/5"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <PageHeader
                title="Edit Product"
                description={`Updating details for "${product?.name}"`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Products", href: "/shop/products" },
                    { label: "Edit Product" },
                ]}
                showBackButton={true}
                actions={
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="shadow-lg shadow-destructive/20 rounded-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Product
                    </Button>
                }
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl border border-sidebar-border/50 p-6 md:p-8"
            >
                <ProductForm mode="edit" productId={id} initialData={product} />
            </motion.div>
        </div>
    );
}
