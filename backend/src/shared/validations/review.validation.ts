import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        rating: z.number()
            .min(1, "Rating must be between 1 and 5")
            .max(5, "Rating must be between 1 and 5"),
        comment: z.string().optional(),
        images: z.array(z.string()).optional(),
    }),
});

export const updateReviewSchema = z.object({
    body: z.object({
        rating: z.number()
            .min(1, "Rating must be between 1 and 5")
            .max(5, "Rating must be between 1 and 5")
            .optional(),
        comment: z.string().optional(),
    }),
});
