import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { orderService } from '../services/order.service';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { customerName, customerPhone, deliveryAddress, notes, items } = req.body;
      const userId = req.user ? req.user.id : undefined;

      const order = await orderService.createOrder({
        userId,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items,
      });

      res.status(201).json({
        success: true,
        message: `تم استلام طلبك بنجاح برقم #${order.orderNumber}`,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }

  async getClientOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'غير مصرح' });
        return;
      }
      const orders = await orderService.getClientOrders(req.user.id);
      res.json({
        success: true,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAdminOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await orderService.getAdminOrders({
        status: status ? (status as OrderStatus) : undefined,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status || !Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'حالة الطلب غير صحيحة',
        });
        return;
      }

      const order = await orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
