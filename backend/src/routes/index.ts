import { Router } from 'express';
import authRoutes from './auth.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import clientRoutes from './client.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Chef Fergany API',
    timestamp: new Date().toISOString(),
  });
});

// Mounted API routes
router.use('/auth', authRoutes);
router.use('/', menuRoutes);
router.use('/', orderRoutes);
router.use('/client', clientRoutes);
router.use('/admin', adminRoutes);

export default router;
