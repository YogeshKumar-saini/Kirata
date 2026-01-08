'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Tag, AlertCircle, Copy, Sparkles, Percent, Scissors, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { OfferForm } from "@/components/shop/offers/offer-form";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface Offer {
    offerId: string;
    code: string;
    type: string;
    value: number;
    description?: string;
    minOrderValue?: number;
    maxDiscount?: number;
    validTo?: string;
    isActive: boolean;
    usageCount: number;
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/offers');
            setOffers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (offerId: string) => {
        if (!confirm('Are you sure you want to deactivate this offer?')) return;
        try {
            await api.patch(`/offers/${offerId}/deactivate`);
            fetchOffers();
            toast({ title: "Offer Deactivated", description: "This promo code is no longer active." });
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            alert(err.response?.data?.message || 'Failed to deactivate offer');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: `Code ${code} copied to clipboard.` });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8 pb-20 p-1"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Offers & Coupons
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg mt-1">
                        Manage your promotional campaigns.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Offer
                </Button>
            </div>

            <OfferForm
                open={createOpen || !!editingOffer}
                onOpenChange={(open) => {
                    setCreateOpen(open);
                    if (!open) setEditingOffer(null);
                }}
                onSuccess={fetchOffers}
                offer={editingOffer}
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Loading active offers...</p>
                </div>
            ) : offers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 text-center"
                >
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Tag className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Active Offers</h3>
                    <p className="text-muted-foreground max-w-md mb-8 text-lg">
                        Boost your sales by creating your first discount code. Customers love a good deal!
                    </p>
                    <Button size="lg" onClick={() => setCreateOpen(true)} className="shadow-xl">
                        <Sparkles className="mr-2 h-4 w-4" /> Create First Offer
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                    <AnimatePresence>
                        {offers.map((offer) => (
                            <motion.div
                                key={offer.offerId}
                                variants={itemVariants}
                                layout
                                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${offer.isActive
                                    ? 'bg-gradient-to-br from-card/80 to-card/40 border-white/10 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5'
                                    : 'bg-muted/10 border-white/5 grayscale opacity-70'
                                    }`}
                            >
                                {/* Ticket Perforation Effect */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border border-white/10 z-10" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-background border border-white/10 z-10" />
                                <div className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-white/10 group-hover:border-primary/20 transition-colors" />

                                {/* Top Section */}
                                <div className="p-6 pb-8 relative pt-8 flex items-start justify-between">
                                    <div className="space-y-1">
                                        <Badge variant={offer.isActive ? "default" : "secondary"} className={offer.isActive ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0" : ""}>
                                            {offer.isActive ? 'Active' : 'Expired'}
                                        </Badge>
                                        <h3 className="font-mono text-3xl font-bold tracking-wider text-white group-hover:text-primary transition-colors flex items-center gap-2 cursor-pointer" onClick={() => copyCode(offer.code)}>
                                            {offer.code}
                                            <Copy className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{offer.description || 'Special Discount'}</p>
                                    </div>
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${offer.type === 'PERCENTAGE' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {offer.type === 'PERCENTAGE' ? <Percent className="h-7 w-7" /> : <span className="text-2xl font-bold">₹</span>}
                                    </div>
                                </div>

                                {/* Bottom Section */}
                                <div className="p-6 pt-8 bg-black/20 space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/10">
                                        <div className="px-1">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Value</p>
                                            <p className="text-lg sm:text-xl font-bold text-white truncate">
                                                {offer.type === 'PERCENTAGE' ? `${offer.value}%` : `₹${offer.value}`}
                                            </p>
                                        </div>
                                        <div className="px-1">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Used</p>
                                            <p className="text-lg sm:text-xl font-bold text-white">{offer.usageCount}</p>
                                        </div>
                                        <div className="px-1">
                                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Expires</p>
                                            <p className={`text-sm font-bold mt-1 ${offer.validTo && new Date(offer.validTo) < new Date() ? 'text-red-400' : 'text-white'
                                                }`}>
                                                {offer.validTo ? format(new Date(offer.validTo), 'MMM d') : 'Never'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Usage Constraints */}
                                    {(offer.minOrderValue || offer.maxDiscount) && (
                                        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground justify-center bg-white/5 py-2 rounded-lg border border-white/5">
                                            {offer.minOrderValue && (
                                                <span className="flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Min Order: ₹{offer.minOrderValue}
                                                </span>
                                            )}
                                            {offer.minOrderValue && offer.maxDiscount && <span>•</span>}
                                            {offer.maxDiscount && (
                                                <span className="flex items-center gap-1">
                                                    <Scissors className="h-3 w-3" /> Max Disc: ₹{offer.maxDiscount}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {offer.isActive && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                className="flex-1 text-primary hover:text-primary hover:bg-primary/10 h-8 text-xs"
                                                onClick={() => setEditingOffer(offer)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="flex-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-xs"
                                                onClick={() => handleDeactivate(offer.offerId)}
                                            >
                                                Deactivate
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    );
}
