import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, MessageSquare, ExternalLink, Calendar, Store } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

import Link from 'next/link';
import { format } from 'date-fns';

interface Review {
    reviewId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    shop: {
        shopId: string;
        name: string;
        city: string;
    }
}

interface ReviewsCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: any;
}

export function ReviewsCard({ variants }: ReviewsCardProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/reviews/my');
                setReviews(response.data.reviews || []);
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <motion.div variants={variants} className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle>My Reviews</CardTitle>
                    </div>
                    <CardDescription>
                        Reviews you have posted for shops
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-16 bg-muted/20 animate-pulse rounded-lg" />
                            <div className="h-16 bg-muted/20 animate-pulse rounded-lg" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>You haven&apos;t reviewed any shops yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {reviews.map((review) => (
                                <Link href={`/customer/shops/${review.shop.shopId}`} key={review.reviewId}>
                                    <div className="border border-border/50 rounded-xl p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {review.shop.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{review.shop.name}</h4>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Store className="h-3 w-3" /> {review.shop.city}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-500 text-xs font-bold border border-yellow-500/20">
                                                <Star className="h-3 w-3 fill-yellow-500 mr-1" />
                                                {review.rating}
                                            </div>
                                        </div>

                                        {review.comment && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 italic">
                                                &quot;{review.comment}&quot;
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                            </span>
                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
