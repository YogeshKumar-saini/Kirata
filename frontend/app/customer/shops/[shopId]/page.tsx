"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';
import {
    ArrowDownLeft, ArrowUpRight, ShoppingBag,
    CreditCard, FileText, Download, Search,
    Store as StoreIcon, List, MessageSquare, MapPin, Phone, Star,
    Book, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

// Component Imports
import { RateShopDialog } from '@/components/customer/rate-shop-dialog';
import { RecordPaymentDialog } from '@/components/customer/record-payment-dialog';
import { CheckoutDialog } from '@/components/customer/checkout-dialog';
import { ReceiptDialog } from '@/components/ledger/receipt-dialog';
import { ShopDetailsSkeleton } from '@/components/customer/shop-details-skeleton';
import { ShopProducts } from '@/components/customer/shop-products';
import { ReviewsSection } from '@/components/customer/reviews-section';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
}

interface Transaction {
    saleId: string;
    amount: string | number;
    paymentType: string;
    runningBalance: number;
    notes: string | null;
    createdAt: string;
}

interface ShopLedger {
    shop: {
        id: string;
        name: string;
        city: string | null;
        phone: string | null;
        rating: number;
    };
    summary: {
        balance: number;
        totalCredit: number;
        totalPaid: number;
    };
    transactions: Transaction[];
}

export default function CustomerShopLedgerPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter] = useState('ALL');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [ledger, setLedger] = useState<ShopLedger | null>(null);
    const [loading, setLoading] = useState(true);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
    const [checkoutMode, setCheckoutMode] = useState<'MANUAL' | 'STORE'>('STORE');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const fetchLedger = useCallback(async () => {
        try {
            const response = await api.get(`/customers/shops/${shopId}/ledger`);
            setLedger(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    useEffect(() => {
        if (shopId) {
            fetchLedger();
        }
    }, [shopId, fetchLedger]);

    const handleCheckout = (mode: 'MANUAL' | 'STORE') => {
        setCheckoutMode(mode);
        setCheckoutDialogOpen(true);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    if (loading) {
        return <ShopDetailsSkeleton />;
    }

    if (!ledger) return <div>Shop not found</div>;

    return (
        <div className="space-y-6 pb-24 md:pb-10 min-h-screen">
            {/* Immersive Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border-b border-white/5 shadow-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/80 z-0" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

                {/* Decorative Blurs */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl z-0" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl z-0" />

                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-6 md:items-end">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-indigo-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5 mb-4">
                            <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <Link href="/customer/shops" className="hover:text-white transition-colors">My Shops</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <span className="text-white font-bold">{ledger.shop.name}</span>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-indigo-500/20 ring-4 ring-white/10 shrink-0">
                                {ledger.shop.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{ledger.shop.name}</h1>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-indigo-200 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-indigo-400" />
                                        {ledger.shop.city || 'Location unavailable'}
                                    </div>
                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-indigo-500/50" />
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-indigo-400" />
                                        {ledger.shop.phone || 'No phone'}
                                    </div>
                                    {ledger.shop.rating && (
                                        <>
                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-indigo-500/50" />
                                            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-0.5 rounded-md text-yellow-400 border border-yellow-500/20">
                                                <Star className="h-3.5 w-3.5 fill-yellow-400" />
                                                <span className="font-bold">{ledger.shop.rating}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {ledger.shop.phone && (
                            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-md" asChild>
                                <Link href={`/customer/personal-ledger/${ledger.shop.phone}`}>
                                    <Book className="mr-2 h-4 w-4" />
                                    Private Ledger
                                </Link>
                            </Button>
                        )}
                        <Button
                            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-0"
                            onClick={() => setPaymentDialogOpen(true)}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now
                        </Button>
                    </div>
                </div>
            </motion.div>

            <Tabs defaultValue="store" className="w-full">
                <div className="flex items-center justify-center mb-6">
                    <TabsList className="bg-card/50 backdrop-blur-md p-1 h-auto rounded-full border shadow-sm">
                        <TabsTrigger value="store" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                            <StoreIcon className="w-4 h-4 mr-2" />
                            Shop Items
                        </TabsTrigger>
                        <TabsTrigger value="ledger" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                            <List className="w-4 h-4 mr-2" />
                            Khata / Ledger
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reviews
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="store" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-3xl border border-blue-500/10"
                    >
                        <div className="mb-4 sm:mb-0">
                            <h3 className="font-bold text-lg text-foreground">Can&apos;t find what you need?</h3>
                            <p className="text-sm text-muted-foreground">Create a manual shopping list and send it to the shopkeeper.</p>
                        </div>
                        <Button onClick={() => handleCheckout('MANUAL')} variant="secondary" className="rounded-full px-6 shadow-sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Create Custom List
                        </Button>
                    </motion.div>

                    <ShopProducts
                        shopId={shopId}
                        cartItems={cartItems}
                        onCartUpdate={setCartItems}
                    />
                </TabsContent>

                <TabsContent value="ledger" className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${ledger.summary.balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {formatCurrency(ledger.summary.balance)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {ledger.summary.balance > 0 ? 'Amount you need to pay' : 'Amount paid in advance'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit Taken</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{formatCurrency(ledger.summary.totalCredit)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Lifetime udhaar taken</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-emerald-500">{formatCurrency(ledger.summary.totalPaid)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Lifetime amount repaid</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-xl bg-card/40 backdrop-blur-md overflow-hidden rounded-[2rem]">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
                            <div>
                                <CardTitle className="text-xl">Transaction History</CardTitle>
                                <CardDescription>All your interactions with {ledger.shop.name}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full md:w-[250px]">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search notes..."
                                        className="pl-9 h-9 rounded-full bg-background/50 border-input/50 focus:bg-background transition-all"
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    title="Download CSV"
                                    className="h-9 w-9 rounded-full bg-background/50 border-input/50 hover:bg-background"
                                    onClick={async () => {
                                        // CSV Export Logic
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/30">
                                {ledger.transactions.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No transactions yet.
                                    </div>
                                ) : (
                                    ledger.transactions
                                        .filter(t => {
                                            const matchesSearch = (t.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                                            const matchesFilter = paymentFilter === 'ALL' || t.paymentType === paymentFilter;
                                            return matchesSearch && matchesFilter;
                                        })
                                        .map((t) => (
                                            <div key={t.saleId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/30 transition-colors gap-3 sm:gap-0">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-full ${t.paymentType === 'UDHAAR' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {t.paymentType === 'UDHAAR' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {t.paymentType === 'UDHAAR' ? 'Credit Purchase' : `Payment via ${t.paymentType}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(t.createdAt).toLocaleDateString()}
                                                        </p>
                                                        {t.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">&quot;{t.notes}&quot;</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
                                                    <div>
                                                        <p className={`font-bold text-sm ${t.paymentType === 'UDHAAR' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                            {t.paymentType === 'UDHAAR' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">
                                                            Bal: {formatCurrency(t.runningBalance)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                                                        onClick={() => setSelectedTransaction(t)}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                    <ReviewsSection shopId={shopId} shopName={ledger.shop.name} onReviewSubmitted={fetchLedger} />
                </TabsContent>
            </Tabs>

            {/* Floating Cart Button */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
                    <div
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl shadow-primary/30 p-2 pl-6 pr-2 flex items-center justify-between pointer-events-auto cursor-pointer transition-all transform hover:scale-[1.02]"
                        onClick={() => handleCheckout('STORE')}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">{cartItemCount} Items</span>
                            <span className="text-xs opacity-90">{formatCurrency(cartTotal)}</span>
                        </div>
                        <Button size="sm" variant="secondary" className="rounded-full px-6 font-bold h-9">
                            View Cart <ShoppingBag className="ml-2 h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <RateShopDialog
                shopId={shopId}
                shopName={ledger.shop.name}
                open={ratingDialogOpen}
                onOpenChange={setRatingDialogOpen}
            />

            <RecordPaymentDialog
                shopId={shopId}
                shopName={ledger.shop.name}
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                onSuccess={fetchLedger}
            />

            <CheckoutDialog
                shopId={shopId}
                shopName={ledger.shop.name}
                open={checkoutDialogOpen}
                onOpenChange={setCheckoutDialogOpen}
                initialItems={checkoutMode === 'STORE' ? cartItems.map(item => ({ productId: item.productId, name: item.name, quantity: item.quantity, price: item.price })) : []}
                mode={checkoutMode}
                onSuccess={() => {
                    setCartItems([]);
                    fetchLedger();
                }}
            />

            {selectedTransaction && (
                <ReceiptDialog
                    transaction={{
                        ...selectedTransaction,
                        amount: Number(selectedTransaction.amount)
                    }}
                    open={!!selectedTransaction}
                    onOpenChange={(open) => !open && setSelectedTransaction(null)}
                    endpoint={`/customers/transactions/${selectedTransaction.saleId}/receipt`}
                />
            )}
        </div>
    );
}
