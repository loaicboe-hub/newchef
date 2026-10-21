import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public auth routes with rate limiting
router.post('/register', authRateLimiter, authController.registerClient);
router.post('/login', authRateLimiter, authController.loginClient);
router.post('/admin/login', authRateLimiter, authController.loginAdmin);

// Protected user profile
router.get('/me', requireAuth, authController.getMe);

export default router;
