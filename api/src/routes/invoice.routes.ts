import { Router } from 'express';
import { downloadInvoice, getAllInvoices } from '../controllers/invoice.controllers.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/requireAdmin.js';
import { UserRole } from '../models/User.js';

const router = Router();
router.use(authenticate); 

router.get('/', authorize(UserRole.ADMIN), getAllInvoices);
router.get('/:bookingId/download', downloadInvoice);

export default router;