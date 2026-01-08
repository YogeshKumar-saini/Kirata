'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { ReviewForm } from "@/components/customer/review-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
    reviewId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    customer: {
        name: string | null;
    };
}

interface ReviewsSectionProps {
    shopId: string;
    shopName: string;
    onReviewSubmitted?: () => void;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted/20 text-muted'}`}
                />
            ))}
        </div>
    );
}

export function ReviewsSection({ shopId, shopName, onReviewSubmitted }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewFormOpen, setReviewFormOpen] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [canReview, setCanReview] = useState(false);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/reviews/shop/${shopId}`);
            setReviews(response.data.reviews || response.data || []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    const checkIfCanReview = useCallback(async () => {
        try {
            // Check if user already reviewed
            const response = await api.get(`/reviews/shop/${shopId}/my`);
            setHasReviewed(true);
            setCanReview(false);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            // If 404, user hasn't reviewed yet
            if (err.response?.status === 404) {
                setHasReviewed(false);
                setCanReview(true);
            }
        }
    }, [shopId]);

    useEffect(() => {
        fetchReviews();
        checkIfCanReview();
    }, [fetchReviews, checkIfCanReview]);

    const handleReviewSuccess = () => {
        fetchReviews();
        checkIfCanReview();
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            {/* Header with Average Rating */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-6 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold font-mono text-primary">{averageRating}</span>
                        <div className="flex flex-col">
                            <StarRating rating={Math.round(Number(averageRating))} />
                            <span className="text-sm text-muted-foreground">{reviews.length} reviews</span>
                        </div>
                    </div>
                </div>
                {canReview && !hasReviewed && (
                    <Button
                        onClick={() => setReviewFormOpen(true)}
                        className="rounded-full px-6"
                    >
                        <Star className="mr-2 h-4 w-4" />
                        Write a Review
                    </Button>
                )}
                {hasReviewed && (
                    <div className="text-sm text-muted-foreground bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        ✓ You&apos;ve already reviewed this shop
                    </div>
                )}
            </div>

            <ReviewForm
                open={reviewFormOpen}
                onOpenChange={setReviewFormOpen}
                onSuccess={handleReviewSuccess}
                shopId={shopId}
                shopName={shopName}
            />

            {/* Reviews List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading reviews...</p>
                </div>
            ) : reviews.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center bg-card/30 rounded-2xl border border-dashed border-white/10"
                >
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Be the first to share your experience with this shop!
                    </p>
                    {canReview && (
                        <Button onClick={() => setReviewFormOpen(true)} className="rounded-full px-6">
                            <Star className="mr-2 h-4 w-4" />
                            Write First Review
                        </Button>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 md:grid-cols-2"
                >
                    <AnimatePresence>
                        {reviews.map((review) => (
                            <motion.div
                                key={review.reviewId}
                                variants={itemVariants}
                                layout
                            >
                                <Card className="glass border-white/10 bg-card/40 hover:bg-card/60 transition-colors duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <Avatar className="h-10 w-10 border border-white/10">
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold">
                                                    {review.customer?.name ? review.customer.name.charAt(0) : 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className="font-semibold">
                                                        {review.customer?.name || 'Anonymous User'}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(review.createdAt)}
                                                    </span>
                                                </div>
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                                &quot;{review.comment}&quot;
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
