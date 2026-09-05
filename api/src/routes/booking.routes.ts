import { Router } from 'express';
import { createBooking, getMyBookings, addReview } from '../controllers/booking.controllers.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate); 

router.post('/', createBooking);
router.get('/me', getMyBookings);
router.put('/:id/review', addReview);

export default router;