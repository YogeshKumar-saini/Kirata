"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const middleware_1 = require("../../auth/middleware");
const service_1 = require("./service");
const router = (0, express_1.Router)();
router.use((0, middleware_1.authMiddleware)(['SHOPKEEPER']));
// Set Transaction PIN
router.patch('/pin', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { pin } = req.body;
    const result = await service_1.shopkeeperService.setTransactionPin(userId, pin);
    res.json(result);
}));
exports.default = router;
