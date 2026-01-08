import { Router } from 'express';
import { authMiddleware } from '../../auth/middleware';
import { asyncHandler } from '../../shared/middlewares/asyncHandler';
import * as PersonalLedgerService from './service';

const router = Router();

// Protect all routes
router.use(authMiddleware(['CUSTOMER', 'SHOPKEEPER']));

router.post('/entries', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const entry = await PersonalLedgerService.addEntry({
        userId,
        ...req.body
    });
    res.status(201).json(entry);
}));

router.get('/contacts', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const contacts = await PersonalLedgerService.getContacts(userId);
    res.json(contacts);
}));

router.get('/contacts/:phone', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { phone } = req.params;
    const details = await PersonalLedgerService.getContactDetails(userId, phone);
    res.json(details);
}));

router.get('/contacts/:phone/statement', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const { phone } = req.params;
    const pdfBuffer = await PersonalLedgerService.generateStatementPDF(userId, phone);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=statement-${phone}.pdf`);
    res.send(pdfBuffer);
}));

router.get('/stats', asyncHandler(async (req, res) => {
    const { userId } = (req as any).user;
    const stats = await PersonalLedgerService.getLedgerStats(userId);
    res.json(stats);
}));

export default router;
