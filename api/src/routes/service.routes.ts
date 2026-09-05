import { Router } from 'express';
import { createService, getServices } from '../controllers/service.controllers.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/requireAdmin.js';
import { UserRole } from '../models/User.js';
const router = Router();

router.get('/', authenticate, getServices);

router.post('/', authenticate, authorize(UserRole.ADMIN), createService);

export default router;