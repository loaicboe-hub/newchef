import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

// Create order - supports both logged-in clients and guest checkout
router.post('/orders', optionalAuth, orderController.createOrder);

export default router;
