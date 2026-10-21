import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { addressController } from '../controllers/address.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Protect all client routes with requireAuth
router.use(requireAuth);

// Client orders history
router.get('/orders', orderController.getClientOrders);

// Client saved addresses
router.get('/addresses', addressController.getUserAddresses);
router.post('/addresses', addressController.addAddress);
router.delete('/addresses/:id', addressController.deleteAddress);

export default router;
