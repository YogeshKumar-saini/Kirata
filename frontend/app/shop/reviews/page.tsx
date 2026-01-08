'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Download, Quote, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
    reviewId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    customer: {
        name: string | null;
        phone: string | null;
    };
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted/20 text-muted'}`}
                />
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const shopResponse = await api.get('/shops/my');
            const fetchedShopId = shopResponse.data[0]?.shopId;

            if (fetchedShopId) {
                const reviewsResponse = await api.get(`/reviews/shop/${fetchedShopId}`);
                setReviews(reviewsResponse.data.reviews || reviewsResponse.data || []);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch reviews:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.message || 'Failed to load reviews';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
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

    // Calculate generic stats
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8 pb-20 p-1"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Customer Reviews
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-3xl font-bold font-mono text-primary">{averageRating}</span>
                        <div className="flex flex-col">
                            <StarRating rating={Math.round(Number(averageRating))} />
                            <span className="text-xs text-muted-foreground">{reviews.length} total reviews</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" asChild className="glass border-white/10 hover:bg-white/5">
                    <Link href="/api/export/reviews" target="_blank">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-xl text-red-500">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Loading feedback...</p>
                </div>
            ) : reviews.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 text-center"
                >
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground max-w-md mb-8 text-lg">
                        Encourage your customers to leave feedback after their purchase.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                >
                    <AnimatePresence>
                        {reviews.map((review) => (
                            <motion.div
                                key={review.reviewId}
                                variants={itemVariants}
                                layout
                                className="break-inside-avoid"
                            >
                                <Card className="glass border-white/5 bg-card/40 hover:bg-card/60 transition-colors duration-300 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary transform rotate-12">
                                        <Quote className="h-12 w-12" />
                                    </div>

                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold">
                                                {review.customer?.name ? review.customer.name.charAt(0) : 'A'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-sm">
                                                    {review.customer?.name || 'Anonymous User'}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed text-muted-foreground/90 italic">
                                            {review.comment ? `"${review.comment}"` : <span className="text-muted-foreground/50 not-italic">No written comment provided.</span>}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-primary">
                                                <ThumbsUp className="h-3 w-3 mr-1" /> Helpful
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    );
}
