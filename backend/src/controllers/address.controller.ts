import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { addressService } from '../services/address.service';

export class AddressController {
  async getUserAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'غير مصرح' });
        return;
      }
      const addresses = await addressService.getUserAddresses(req.user.id);
      res.json({
        success: true,
        data: addresses,
      });
    } catch (err) {
      next(err);
    }
  }

  async addAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'غير مصرح' });
        return;
      }
      const address = await addressService.addAddress(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'تم إضافة العنوان بنجاح',
        data: address,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'غير مصرح' });
        return;
      }
      const id = req.params.id as string;
      await addressService.deleteAddress(req.user.id, id);
      res.json({
        success: true,
        message: 'تم حذف العنوان بنجاح',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const addressController = new AddressController();
