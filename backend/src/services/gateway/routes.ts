import { Router } from 'express';
import { handleWebhook, verifyWebhook } from '../ingestion/controller';

const router = Router();

// --- WEBHOOK ROUTES ---
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhook);

export default router;
