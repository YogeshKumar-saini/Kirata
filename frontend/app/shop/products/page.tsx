'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Package, Layers } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { BulkUploadDialog } from "@/components/shop/products/bulk-upload-dialog";
import { VariantManager } from "@/components/shop/products/variant-manager";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTable, Column } from "@/components/ui/PremiumTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Product {
    id: string; // Required for PremiumTable
    productId: string;
    name: string;
    category: string | null;
    price: number;
    stock: number;
    isActive: boolean;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [variantDialogOpen, setVariantDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });

    const fetchProducts = useCallback(async (pageNum: number = 1, search: string = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', pageNum.toString());
            params.append('limit', '12');
            if (search) params.append('search', search);

            const response = await api.get(`/products?${params.toString()}`);
            const data = response.data;
            if (data.products && Array.isArray(data.products)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setProducts(data.products.map((p: any) => ({ ...p, id: p.productId })));
                setMeta(data.meta || { total: 0, page: 1, limit: 12, totalPages: 1 });
            } else if (Array.isArray(data)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setProducts(data.map((p: any) => ({ ...p, id: p.productId })));
            } else {
                setProducts([]);
            }

        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${productId}`);
            fetchProducts();
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((err as any).response?.data?.message || 'Failed to delete product');
        }
    };

    const columns: Column<Product>[] = [
        {
            header: "Product",
            accessorKey: "name",
            sortable: true,
            cell: (product) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {product.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.category || 'Uncategorized'}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Price",
            accessorKey: "price",
            sortable: true,
            cell: (product) => (
                <span className="font-medium">₹{Number(product.price).toLocaleString()}</span>
            )
        },
        {
            header: "Stock Status",
            accessorKey: "stock",
            sortable: true,
            cell: (product) => (
                <StatusBadge
                    status={product.stock > 0 ? "success" : "error"}
                    label={product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                    pulsing={product.stock <= 5 && product.stock > 0}
                />
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (product) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => {
                            setSelectedProduct({ id: product.productId, name: product.name });
                            setVariantDialogOpen(true);
                        }}
                        title="Manage Variants"
                    >
                        <Layers className="h-4 w-4 text-primary" />
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                        <Link href={`/shop/products/${product.productId}`}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                        onClick={() => handleDelete(product.productId)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <PageHeader
                title="Products"
                description={`Manage your catalog of ${meta.total} items`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Products" },
                ]}
                actions={
                    <div className="flex gap-2 w-full sm:w-auto">
                        <BulkUploadDialog onSuccess={() => fetchProducts()} />
                        <Button asChild size="default" className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            <Link href="/shop/products/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                }
            />

            <PremiumTable<Product>
                data={products}
                columns={columns}
                isLoading={loading}
                searchKey="name"
                searchPlaceholder="Search products..."
                pagination={true}
                itemsPerPage={12}
                emptyStateConfig={{
                    icon: Package,
                    title: "No products found",
                    description: "Get started by adding your first product to the inventory.",
                    actionLabel: "Add Product",
                    onAction: () => document.getElementById('add-product-link')?.click() // Fallback or route 
                }}
            />

            {/* Variant Manager Dialog */}
            {selectedProduct && (
                <VariantManager
                    open={variantDialogOpen}
                    onOpenChange={setVariantDialogOpen}
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                    onSuccess={() => fetchProducts()}
                />
            )}
        </div>
    );
}
