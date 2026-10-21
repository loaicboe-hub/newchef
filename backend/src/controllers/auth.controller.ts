import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { authService } from '../services/auth.service';

export class AuthController {
  async registerClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fullName, phone, password } = req.body;
      const result = await authService.registerClient({ fullName, phone, password });
      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب وتسجيل الدخول بنجاح',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async loginClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body;
      const result = await authService.loginClient({ phone, password });
      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async loginAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, email, phone, identifier, password } = req.body;
      const loginId = identifier || email || username || phone;
      const result = await authService.loginAdmin({ identifier: loginId, password });
      res.json({
        success: true,
        message: 'مرحباً بك في لوحة تحكم مطابخ الشيف فرجاني',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'غير مصرح' });
        return;
      }
      const user = await authService.getMe(req.user.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
