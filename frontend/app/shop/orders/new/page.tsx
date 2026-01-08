'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Loader2, Tag, ShoppingCart, Minus, CreditCard, Sparkles, ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/PageHeader";

interface Product {
    productId: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
}

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
}

interface CartItem {
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

export default function NewOrderPage() {
    const router = useRouter();

    // State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(false);

    // Search State
    const [productSearch, setProductSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);

    const [customerSearch, setCustomerSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

    // Offer State
    const [offerCode, setOfferCode] = useState("");
    const [appliedOffer, setAppliedOffer] = useState<{ code: string; discount: number } | null>(null);
    const [validatingOffer, setValidatingOffer] = useState(false);

    // --- Product Search ---
    useEffect(() => {
        const timer = setTimeout(() => {
            if (productSearch.length >= 1) {
                searchProducts(productSearch);
            } else if (productSearch.length === 0) {
                searchProducts("");
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    useEffect(() => {
        searchProducts("");
    }, []);

    const searchProducts = async (query: string) => {
        try {
            setIsSearchingProducts(true);
            const res = await api.get(`/products?search=${query}&limit=12`);
            setProducts(res.data.products || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearchingProducts(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.productId);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.productId
                        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                        : item
                );
            }
            return [...prev, {
                productId: product.productId,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                total: Number(product.price)
            }];
        });
    };

    // --- Customer Search ---
    const handleCustomerSearch = async () => {
        if (customerSearch.length < 3) return;
        try {
            setIsSearchingCustomers(true);
            const res = await api.post('/shops/customers/lookup', { phone: customerSearch });
            setCustomers(res.data ? [res.data] : []);
        } catch (err) {
            console.error(err);
            setCustomers([]);
        } finally {
            setIsSearchingCustomers(false);
        }
    };

    // --- Cart Actions ---
    const updateQuantity = (index: number, newQty: number) => {
        if (newQty < 1) return;
        setCart(prev => prev.map((item, i) =>
            i === index ? { ...item, quantity: newQty, total: newQty * item.price } : item
        ));
    };

    const addAdHocItem = () => {
        setCart(prev => [...prev, {
            name: "Custom Item",
            price: 0,
            quantity: 1,
            total: 0
        }]);
    };

    // --- Offer Validation ---
    const validateOffer = async () => {
        if (!offerCode) return;
        try {
            setValidatingOffer(true);
            const subTotal = cart.reduce((acc, item) => acc + item.total, 0);
            const res = await api.post('/offers/validate', {
                code: offerCode,
                cartValue: subTotal
            });
            setAppliedOffer({
                code: res.data.code,
                discount: res.data.discountAmount
            });
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            alert(err.response?.data?.message || 'Invalid Offer');
            setAppliedOffer(null);
        } finally {
            setValidatingOffer(false);
        }
    };

    const subTotal = cart.reduce((acc, item) => acc + item.total, 0);
    const discount = appliedOffer ? appliedOffer.discount : 0;
    const total = Math.max(0, subTotal - discount);

    const handleSubmit = async () => {
        if (!customer) {
            alert("Please select a customer");
            return;
        }
        if (cart.length === 0) {
            alert("Cart is empty");
            return;
        }

        try {
            setLoading(true);
            const shopRes = await api.get('/shops/my');
            const shopId = shopRes.data?.shopId;
            if (!shopId) throw new Error("Shop not found");

            const payload = {
                customerId: customer.id,
                shopId: shopId,
                items: cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                offerCode: appliedOffer ? appliedOffer.code : undefined
            };

            await api.post('/orders', payload);
            router.push('/shop/orders');

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 max-w-[1600px] mx-auto pb-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="shrink-0">
                <PageHeader
                    title="New Order"
                    description="POS Terminal"
                    showBackButton={true}
                    breadcrumbs={[
                        { label: "Dashboard", href: "/shop" },
                        { label: "Orders", href: "/shop/orders" },
                        { label: "New Order" }
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full bg-muted/20 border border-border/50 text-xs font-mono text-muted-foreground">
                                {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    }
                />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left: Product Grid (7/12) */}
                <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
                    {/* Search Bar */}
                    <div className="relative shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9 h-12 text-lg bg-card/50 border-border/40 rounded-xl focus:ring-primary/20"
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            autoFocus
                        />
                        {isSearchingProducts && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <ScrollArea className="flex-1 rounded-2xl border border-border/40 bg-card/30 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={addAdHocItem}
                                className="aspect-[4/3] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-transparent hover:bg-muted/20 transition-colors p-4"
                            >
                                <Plus className="h-8 w-8 text-primary/50" />
                                <span className="font-medium text-sm text-muted-foreground">Custom Amount</span>
                            </motion.button>

                            {products.map(product => (
                                <motion.button
                                    key={product.productId}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(product)}
                                    className="aspect-[4/3] flex flex-col items-start justify-between rounded-xl bg-card border border-border/40 hover:border-primary/50 p-4 transition-colors text-left group relative overflow-hidden shadow-sm"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div>
                                        <h3 className="font-semibold line-clamp-2 leading-tight mb-1">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground">In Stock: {product.stock}</p>
                                    </div>
                                    <div className="w-full flex justify-between items-end">
                                        <span className="font-bold text-lg">₹{product.price}</span>
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="h-3 w-3" />
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                            {products.length === 0 && !isSearchingProducts && (
                                <div className="col-span-full py-20 text-center text-muted-foreground">
                                    No products found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right: Cart & Checkout (5/12) */}
                <div className="lg:col-span-5 flex flex-col gap-4 min-h-0 h-full">
                    {/* Customer Section */}
                    <Card className="shrink-0 glass border-border/40 shadow-sm">
                        <CardContent className="p-3">
                            {!customer ? (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Customer Phone..."
                                            className="pl-8 bg-background/50"
                                            value={customerSearch}
                                            onChange={e => setCustomerSearch(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleCustomerSearch} disabled={isSearchingCustomers}>
                                        {isSearchingCustomers ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
                                    </Button>

                                    {customers.length > 0 && (
                                        <div className="absolute top-16 left-4 right-4 z-50 p-2 bg-popover border rounded-lg shadow-xl">
                                            {customers.map(c => (
                                                <div key={c.id} onClick={() => { setCustomer(c); setCustomers([]); setCustomerSearch(""); }} className="p-2 hover:bg-muted rounded cursor-pointer">
                                                    <p className="font-bold">{c.name}</p>
                                                    <p className="text-xs">{c.phone}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border/40">
                                            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                {customer.name?.charAt(0) || 'C'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold leading-none">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setCustomer(null)} className="h-8 text-xs">
                                        Change
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cart Items */}
                    <Card className="flex-1 flex flex-col min-h-0 border-border/40 bg-card/40 overflow-hidden shadow-xl">
                        <CardHeader className="p-4 border-b border-border/40 bg-muted/40">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" /> Current Order
                                </CardTitle>
                                <Badge variant="secondary">{cart.length} Items</Badge>
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-0">
                            <div className="flex flex-col">
                                <AnimatePresence initial={false}>
                                    {cart.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="flex items-center gap-3 p-3 border-b border-border/40 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex-1 overflow-hidden">
                                                {item.productId ? (
                                                    <p className="font-medium truncate">{item.name}</p>
                                                ) : (
                                                    <Input
                                                        value={item.name}
                                                        onChange={e => {
                                                            const newCart = [...cart];
                                                            newCart[idx].name = e.target.value;
                                                            setCart(newCart);
                                                        }}
                                                        className="h-7 text-sm bg-transparent border-none p-0 focus-visible:ring-0"
                                                    />
                                                )}
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <span>₹</span>
                                                    {item.productId ? (
                                                        <span>{item.price}</span>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={e => {
                                                                const val = Number(e.target.value);
                                                                const newCart = [...cart];
                                                                newCart[idx].price = val;
                                                                newCart[idx].total = val * item.quantity;
                                                                setCart(newCart);
                                                            }}
                                                            className="w-16 bg-transparent border-b border-white/10 text-xs focus:outline-none"
                                                        />
                                                    )}
                                                    <span> x {item.quantity}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center bg-muted/50 rounded-lg border border-border/40">
                                                <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-l-lg transition-colors">
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-r-lg transition-colors">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <div className="w-20 text-right font-medium">
                                                ₹{item.total.toFixed(2)}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {cart.length === 0 && (
                                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                                        <ShoppingBag className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Cart is empty</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer Totals */}
                        <div className="p-4 bg-muted/20 border-t border-border/40 space-y-4">
                            {/* Offers */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Promo Code"
                                        className="h-9 pl-8 text-sm bg-background/50"
                                        value={offerCode}
                                        onChange={e => setOfferCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedOffer}
                                    />
                                </div>
                                {appliedOffer ? (
                                    <Button variant="ghost" size="sm" onClick={() => { setAppliedOffer(null); setOfferCode(""); }} className="h-9 text-red-400 hover:text-red-300">
                                        Remove
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="secondary" className="h-9" onClick={validateOffer} disabled={!offerCode || validatingOffer}>
                                        {validatingOffer ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                                    </Button>
                                )}
                            </div>
                            {appliedOffer && (
                                <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded">
                                    <Sparkles className="h-3 w-3" /> Offer applied: -₹{appliedOffer.discount}
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-lg font-bold">Total Payable</span>
                                    <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full text-lg font-bold h-12 shadow-lg shadow-primary/20"
                                onClick={handleSubmit}
                                disabled={loading || cart.length === 0 || !customer}
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                                Complete Order
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
