import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { orderController } from '../controllers/order.controller';
import { menuController } from '../controllers/menu.controller';
import { customerController } from '../controllers/customer.controller';
import { requireAdmin } from '../middlewares/auth';
import { uploadSingleImage, optimizeAndSaveImage } from '../middlewares/upload';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Admin login route (also accessible via /api/admin/login)
router.post('/login', authRateLimiter, authController.loginAdmin);

// All routes below require ADMIN or SUPER_ADMIN role
router.use(requireAdmin);

// Orders management
router.get('/orders', orderController.getAdminOrders);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// Menu management with Multer & Sharp image optimization
router.post(
  '/menu',
  uploadSingleImage,
  optimizeAndSaveImage,
  menuController.createMenuItem
);
router.put(
  '/menu/:id',
  uploadSingleImage,
  optimizeAndSaveImage,
  menuController.updateMenuItem
);
router.delete('/menu/:id', menuController.deleteMenuItem);

// Categories management
router.post('/categories', menuController.createCategory);
router.put('/categories/:id', menuController.updateCategory);
router.delete('/categories/:id', menuController.deleteCategory);

// Customers report & records
router.get('/customers', customerController.getCustomers);

export default router;
