import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { customerService } from '../services/customer.service';

export class CustomerController {
  async getCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const result = await customerService.getCustomers({
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
