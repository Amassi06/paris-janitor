import { Router } from 'express';
import { downloadInvoice } from '../controllers/invoice.controllers.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();
router.use(authenticate); 

router.get('/:bookingId/download', downloadInvoice);

export default router;