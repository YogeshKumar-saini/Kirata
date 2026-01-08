import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import { requireShop } from '../../shared/middlewares/auth.middleware';
import { authMiddleware } from '../../auth/middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createOfferSchema, validateOfferSchema } from '../../shared/validations/offer.validation';
import * as OfferService from './service';

const router = Router();

router.use(authMiddleware(['SHOPKEEPER']));
router.use(requireShop);

// Get all offers
router.get('/', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const offers = await OfferService.getShopOffers(shopId);
    res.json(offers);
}));

// Create new offer
router.post('/', validate(createOfferSchema), asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const offer = await OfferService.createOffer(shopId, req.body);
    res.status(201).json(offer);
}));

// Validate offer code
router.post('/validate', validate(validateOfferSchema), asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { code, cartValue } = req.body;

    const result = await OfferService.validateAndCalculate(shopId, code, cartValue);
    res.json(result);
}));

// Update offer
router.patch('/:offerId', validate(createOfferSchema), asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { offerId } = req.params;
    const offer = await OfferService.updateOffer(shopId, offerId, req.body);
    res.json(offer);
}));

// Deactivate offer
router.patch('/:offerId/deactivate', asyncHandler(async (req, res) => {
    const shopId = (req as any).shopId;
    const { offerId } = req.params;
    await OfferService.deactivateOffer(shopId, offerId);
    res.json({ message: 'Offer deactivated successfully' });
}));

export default router;
