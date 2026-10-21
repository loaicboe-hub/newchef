import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  role: Role;
  phone: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    phone: string;
    fullName: string;
    email?: string | null;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح: يرجى تسجيل الدخول أولاً',
        messageEn: 'Unauthorized: Please login first',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        phone: true,
        fullName: true,
        email: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'الحساب غير متاح أو تم إيقافه',
        messageEn: 'Account is inactive or not found',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'جلسة تسجيل الدخول منتهية، يرجى إعادة تسجيل الدخول',
      messageEn: 'Invalid or expired session token',
    });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== Role.ADMIN && req.user.role !== Role.SUPER_ADMIN)) {
      res.status(403).json({
        success: false,
        message: 'هذه العملية تتطلب صلاحيات إدارة المطعم',
        messageEn: 'Forbidden: Admin access required',
      });
      return;
    }
    next();
  });
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          phone: true,
          fullName: true,
          email: true,
          isActive: true,
        },
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Non-blocking: proceed as guest
  }
  next();
};
