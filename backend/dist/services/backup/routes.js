"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_1 = require("./service");
const middleware_1 = require("../../auth/middleware");
const pin_auth_middleware_1 = require("../../shared/middlewares/pin-auth.middleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
// Export Backup
router.get('/export', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), async (req, res) => {
    try {
        const shopId = req.user?.shopId;
        if (!shopId) {
            res.status(400).json({ error: 'Shop ID required' });
            return;
        }
        const backupData = await service_1.backupService.createBackup(shopId);
        const fileName = `kirata-backup-${new Date().toISOString().split('T')[0]}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(JSON.stringify(backupData, null, 2));
    }
    catch (error) {
        console.error('Backup export error:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});
// Import Backup
// Critical action: Requires PIN authentication
router.post('/import', (0, middleware_1.authMiddleware)(['SHOPKEEPER']), pin_auth_middleware_1.verifyPinMiddleware, upload.single('file'), async (req, res) => {
    try {
        const shopId = req.user?.shopId;
        if (!shopId) {
            res.status(400).json({ error: 'Shop ID required' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No backup file provided' });
            return;
        }
        let backupData;
        try {
            const jsonString = req.file.buffer.toString('utf-8');
            backupData = JSON.parse(jsonString);
        }
        catch (e) {
            res.status(400).json({ error: 'Invalid JSON file' });
            return;
        }
        await service_1.backupService.restoreBackup(shopId, backupData);
        res.json({ message: 'Backup restored successfully' });
    }
    catch (error) {
        console.error('Backup restore error:', error);
        res.status(500).json({ error: error.message || 'Failed to restore backup' });
    }
});
exports.default = router;
