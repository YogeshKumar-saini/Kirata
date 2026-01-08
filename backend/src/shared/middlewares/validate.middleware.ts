import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiError } from '../errors/ApiError';

export const validate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.issues.map((e: any) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            console.error('Validation Errors:', JSON.stringify(errors, null, 2));
            console.error('Request Body:', JSON.stringify(req.body, null, 2));
            next(new ApiError(400, 'Validation Error', errors));
        } else {
            next(error);
        }
    }
};
