import prisma from '../config/prisma';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { normalizeEgyptianPhone, isValidEgyptianPhone } from '../middlewares/validators';

export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItemInput[];
}

export class OrderService {
  async createOrder(data: CreateOrderInput) {
    const { customerName, customerPhone, deliveryAddress, notes, items } = data;

    if (!customerName || customerName.trim().length < 2) {
      throw new Error('يرجى كتابة اسم العميل بشكل صحيح');
    }

    const normalizedPhone = normalizeEgyptianPhone(customerPhone);
    if (!isValidEgyptianPhone(normalizedPhone)) {
      throw new Error('يرجى إدخال رقم هاتف مصري صحيح (11 رقم)');
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      throw new Error('يرجى كتابة عنوان التوصيل بالتفصيل');
    }

    if (!items || items.length === 0) {
      throw new Error('السلة فارغة، يرجى اختيار صنف واحد على الأقل');
    }

    // Resolve or Auto-create User for this phone number to preserve customer history!
    let userId = data.userId;
    if (!userId) {
      let existingUser = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });

      if (!existingUser) {
        // Auto-create guest client user
        const dummyPasswordHash = await bcrypt.hash(`Guest@${Date.now()}`, 10);
        existingUser = await prisma.user.create({
          data: {
            fullName: customerName.trim(),
            phone: normalizedPhone,
            password_hash: dummyPasswordHash,
            role: Role.CLIENT,
          },
        });
      }
      userId = existingUser.id;
    }

    // Fetch menu items from database to compute real authoritative prices
    const itemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
    });

    const itemPriceMap = new Map<string, Prisma.Decimal>();
    for (const p of dbMenuItems) {
      itemPriceMap.set(p.id, p.price);
    }

    let calculatedTotal = new Prisma.Decimal(0);
    const orderItemsCreateData: {
      menuItemId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
    }[] = [];

    for (const item of items) {
      const price = itemPriceMap.get(item.menuItemId);
      if (!price) {
        throw new Error(`الصنف المختار غير متوفر حالياً`);
      }
      const qty = Math.max(1, item.quantity);
      const subtotal = price.mul(qty);
      calculatedTotal = calculatedTotal.add(subtotal);

      orderItemsCreateData.push({
        menuItemId: item.menuItemId,
        quantity: qty,
        unitPrice: price,
      });
    }

    // Create Order with its items in a transaction
    const order = await prisma.order.create({
      data: {
        userId,
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        deliveryAddressSnapshot: deliveryAddress.trim(),
        notes: notes?.trim() || null,
        totalAmount: calculatedTotal,
        status: OrderStatus.PENDING,
        items: {
          create: orderItemsCreateData,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                title_ar: true,
                title_en: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return order;
  }

  async getClientOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                title_ar: true,
                title_en: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async getAdminOrders(params: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const num = parseInt(q, 10);
      where.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q } },
        { deliveryAddressSnapshot: { contains: q, mode: 'insensitive' } },
        ...(isNaN(num) ? [] : [{ orderNumber: num }]),
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  title_ar: true,
                  title_en: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                title_ar: true,
                title_en: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }
}

export const orderService = new OrderService();
