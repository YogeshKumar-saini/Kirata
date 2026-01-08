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
const middleware_1 = require("../../auth/middleware");
const asyncHandler_1 = require("../../shared/middlewares/asyncHandler");
const PersonalLedgerService = __importStar(require("./service"));
const router = (0, express_1.Router)();
// Protect all routes
router.use((0, middleware_1.authMiddleware)(['CUSTOMER', 'SHOPKEEPER']));
router.post('/entries', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const entry = await PersonalLedgerService.addEntry({
        userId,
        ...req.body
    });
    res.status(201).json(entry);
}));
router.get('/contacts', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const contacts = await PersonalLedgerService.getContacts(userId);
    res.json(contacts);
}));
router.get('/contacts/:phone', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { phone } = req.params;
    const details = await PersonalLedgerService.getContactDetails(userId, phone);
    res.json(details);
}));
router.get('/contacts/:phone/statement', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const { phone } = req.params;
    const pdfBuffer = await PersonalLedgerService.generateStatementPDF(userId, phone);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=statement-${phone}.pdf`);
    res.send(pdfBuffer);
}));
router.get('/stats', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.user;
    const stats = await PersonalLedgerService.getLedgerStats(userId);
    res.json(stats);
}));
exports.default = router;
