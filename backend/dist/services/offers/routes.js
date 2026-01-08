"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const middleware_1 = require("../../auth/middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const offer_validation_1 = require("../../shared/validations/offer.validation");
const OfferService = __importStar(require("./service"));
const router = (0, express_1.Router)();
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
router.use(auth_middleware_1.requireShop);
// Get all offers
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const offers = await OfferService.getShopOffers(shopId);
    res.json(offers);
}));
// Create new offer
router.post('/', (0, validate_middleware_1.validate)(offer_validation_1.createOfferSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const offer = await OfferService.createOffer(shopId, req.body);
    res.status(201).json(offer);
}));
// Validate offer code
router.post('/validate', (0, validate_middleware_1.validate)(offer_validation_1.validateOfferSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { code, cartValue } = req.body;
    const result = await OfferService.validateAndCalculate(shopId, code, cartValue);
    res.json(result);
}));
// Update offer
router.patch('/:offerId', (0, validate_middleware_1.validate)(offer_validation_1.createOfferSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { offerId } = req.params;
    const offer = await OfferService.updateOffer(shopId, offerId, req.body);
    res.json(offer);
}));
// Deactivate offer
router.patch('/:offerId/deactivate', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const shopId = req.shopId;
    const { offerId } = req.params;
    await OfferService.deactivateOffer(shopId, offerId);
    res.json({ message: 'Offer deactivated successfully' });
}));
exports.default = router;
