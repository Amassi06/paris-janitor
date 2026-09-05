import Router from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createCheckoutSession } from '../controllers/payment.controllers.js';

const router = Router();

router.use(authenticate); 

router.post("/:bookingId/checkout",createCheckoutSession);

export default router;