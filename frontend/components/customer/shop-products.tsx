"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Minus, Store } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

interface Product {
    productId: string;
    name: string;
    price: number;
    mrp?: number;
    imageUrl?: string;
    stock: number;
    category?: string;
}

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
}

interface ShopProductsProps {
    shopId: string;
    onCartUpdate: (items: CartItem[]) => void;
    cartItems: CartItem[];
}

export function ShopProducts({ shopId, onCartUpdate, cartItems }: ShopProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category] = useState<string>('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (category) params.append('category', category);

                const res = await api.get(`/shops/${shopId}/products?${params.toString()}`);
                setProducts(res.data.products || res.data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [shopId, search, category]);

    const addToCart = (product: Product) => {
        const existing = cartItems.find((i) => i.productId === product.productId);
        if (existing) {
            updateQuantity(product.productId, existing.quantity + 1);
        } else {
            onCartUpdate([...cartItems, {
                productId: product.productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            }]);
        }
    };

    const updateQuantity = (productId: string, qty: number) => {
        if (qty < 0) return;

        if (qty === 0) {
            onCartUpdate(cartItems.filter((i) => i.productId !== productId));
            return;
        }

        const updated = cartItems.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i
        );
        onCartUpdate(updated);
    };

    const getQuantityInCart = (productId: string) => {
        const item = cartItems.find((i) => i.productId === productId);
        return item ? item.quantity : 0;
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-9 bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground font-medium">No products found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try changing your search terms</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => {
                        const qty = getQuantityInCart(product.productId);
                        return (
                            <Card key={product.productId} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
                                {/* Placeholder for image if we had one */}
                                <div className="aspect-[4/3] bg-muted relative">
                                    {product.imageUrl ? (
                                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground/30">
                                            <Store className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-3 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="font-bold text-foreground">{formatCurrency(product.price)}</span>
                                            {product.mrp && product.mrp > product.price && (
                                                <span className="text-xs text-muted-foreground line-through decoration-destructive">{formatCurrency(product.mrp)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        {qty > 0 ? (
                                            <div className="flex items-center justify-between bg-muted/50 rounded-md p-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.productId, qty - 1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-6 text-center">{qty}</span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.productId, qty + 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs h-8 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                                onClick={() => addToCart(product)}
                                            >
                                                Add to Cart
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
