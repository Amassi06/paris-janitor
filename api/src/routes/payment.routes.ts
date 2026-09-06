import Router from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createCheckoutSession } from '../controllers/payment.controllers.js';
import {createSubscriptionCheckout} from '../controllers/payment.controllers.js';
const router = Router();

router.use(authenticate); 

router.post("/subscription/checkout", createSubscriptionCheckout);
router.post("/:bookingId/checkout",createCheckoutSession);
export default router;