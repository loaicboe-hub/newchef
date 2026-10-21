import prisma from '../config/prisma';
import { Prisma, Role } from '@prisma/client';

export class CustomerService {
  async getCustomers(params: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: Role.CLIENT,
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          isActive: true,
          createdAt: true,
          addresses: {
            take: 2,
            orderBy: { isDefault: 'desc' },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Format customers with calculated totalSpent and ordersCount
    const formatted = users.map((u) => {
      const totalSpent = u.orders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0
      );
      return {
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        isActive: u.isActive,
        createdAt: u.createdAt,
        totalOrders: u.orders.length,
        totalSpent,
        lastOrder: u.orders[0] || null,
        addresses: u.addresses,
      };
    });

    return {
      customers: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}

export const customerService = new CustomerService();
