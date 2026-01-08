import { Router, Request, Response } from 'express';
import { backupService } from './service';
import { authMiddleware } from '../../auth/middleware';
import { verifyPinMiddleware } from '../../shared/middlewares/pin-auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Export Backup
router.get('/export', authMiddleware(['SHOPKEEPER']), async (req: Request, res: Response) => {
    try {
        const shopId = req.user?.shopId;
        if (!shopId) {
            res.status(400).json({ error: 'Shop ID required' });
            return;
        }

        const backupData = await backupService.createBackup(shopId);

        const fileName = `kirata-backup-${new Date().toISOString().split('T')[0]}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(JSON.stringify(backupData, null, 2));
    } catch (error) {
        console.error('Backup export error:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Import Backup
// Critical action: Requires PIN authentication
router.post('/import',
    authMiddleware(['SHOPKEEPER']),
    verifyPinMiddleware,
    upload.single('file'),
    async (req: Request, res: Response): Promise<void> => {
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
            } catch (e) {
                res.status(400).json({ error: 'Invalid JSON file' });
                return;
            }

            await backupService.restoreBackup(shopId, backupData);

            res.json({ message: 'Backup restored successfully' });
        } catch (error: any) {
            console.error('Backup restore error:', error);
            res.status(500).json({ error: error.message || 'Failed to restore backup' });
        }
    });

export default router;
