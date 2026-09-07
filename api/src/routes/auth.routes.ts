import { Router } from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/auth.controllers.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/requireAdmin.js';
import { User, UserRole } from '../models/User.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/users',authenticate,authorize(UserRole.ADMIN),getAllUsers)
export default router;