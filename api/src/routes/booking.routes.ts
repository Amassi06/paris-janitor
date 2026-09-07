import { Router } from 'express';
import { createBooking, getMyBookings, addReview,getAllBookings } from '../controllers/booking.controllers.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/requireAdmin.js';
import { UserRole } from '../models/User.js';
const router = Router();

router.use(authenticate); 

router.post('/', createBooking);
router.get('/me', getMyBookings);
router.put('/:id/review', addReview);

router.get('/', authorize(UserRole.ADMIN), getAllBookings);

export default router;