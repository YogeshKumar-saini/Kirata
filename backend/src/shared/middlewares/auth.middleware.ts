import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';
import * as ShopService from '../../services/shops/service';

export const requireShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req as any).user) {
            throw new ApiError(401, 'Authentication required');
        }
        const { userId } = (req as any).user;
        const shop = await ShopService.getShopByOwnerId(userId);

        if (!shop) {
            throw new ApiError(404, 'You must create a shop before managing this resource.');
        }

        (req as any).shopId = shop.shopId;
        next();
    } catch (error) {
        next(error);
    }
};
