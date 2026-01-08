
import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { authMiddleware } from '../../auth/middleware';
import { shopkeeperService } from './service';

const router = Router();

router.use(authMiddleware(['SHOPKEEPER']));

// Set Transaction PIN
router.patch('/pin', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { pin } = req.body;

    const result = await shopkeeperService.setTransactionPin(userId, pin);
    res.json(result);
}));

export default router;
