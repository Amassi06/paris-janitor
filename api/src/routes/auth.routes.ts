import { Router } from 'express';
import { register, login, refresh, logout, getMe, getAllUsers, setUserBan, updateUser } from '../controllers/auth.controllers.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/requireAdmin.js';
import { User, UserRole } from '../models/User.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.get('/users',authenticate,authorize(UserRole.ADMIN),getAllUsers);
router.patch('/users/:id', authenticate, authorize(UserRole.ADMIN), updateUser);
router.patch('/users/:id/ban', authenticate, authorize(UserRole.ADMIN), setUserBan);

export default router;