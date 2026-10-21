import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import { normalizeEgyptianPhone, isValidEgyptianPhone } from '../middlewares/validators';

export class AuthService {
  private generateToken(userId: string, role: Role, phone: string): string {
    return jwt.sign(
      { userId, role, phone },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  async registerClient(data: { fullName: string; phone: string; password?: string }) {
    const { fullName, phone, password } = data;

    if (!fullName || fullName.trim().length < 2) {
      throw new Error('يرجى إدخال الاسم بالكامل');
    }

    const normalizedPhone = normalizeEgyptianPhone(phone);
    if (!isValidEgyptianPhone(normalizedPhone)) {
      throw new Error('يرجى إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015)');
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      throw new Error('رقم الهاتف مسجل بالفعل، يمكنك تسجيل الدخول مباشرة');
    }

    const rawPassword = password || '123456';
    if (rawPassword.length < 6) {
      throw new Error('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
    }

    const password_hash = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        phone: normalizedPhone,
        password_hash,
        role: Role.CLIENT,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id, user.role, user.phone);

    return { user, token };
  }

  async loginClient(data: { phone: string; password?: string }) {
    const { phone, password } = data;

    const normalizedPhone = normalizeEgyptianPhone(phone);
    if (!isValidEgyptianPhone(normalizedPhone)) {
      throw new Error('رقم الهاتف غير صحيح');
    }

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new Error('رقم الهاتف غير مسجل، يرجى إنشاء حساب جديد');
    }

    if (!user.isActive) {
      throw new Error('تم تعطيل هذا الحساب، يرجى التواصل مع إدارة المطعم');
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new Error('كلمة المرور غير صحيحة');
      }
    }

    const token = this.generateToken(user.id, user.role, user.phone);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async loginAdmin(data: { identifier: string; password?: string }) {
    const { identifier, password } = data;
    if (!identifier || !password) {
      throw new Error('يرجى إدخال اسم المستخدم/البريد وكلمة المرور');
    }

    const normalizedPhone = normalizeEgyptianPhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { phone: normalizedPhone },
          { phone: identifier.trim() },
        ],
      },
    });

    if (!user) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new Error('ليس لديك صلاحية الدخول للوحة التحكم');
    }

    if (!user.isActive) {
      throw new Error('حساب الأدمن معطل حالياً');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    const token = this.generateToken(user.id, user.role, user.phone);

    return {
      admin: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                menuItem: {
                  select: { title_ar: true, title_en: true, imageUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    return user;
  }
}

export const authService = new AuthService();
