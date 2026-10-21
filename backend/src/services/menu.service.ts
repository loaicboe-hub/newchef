import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class MenuService {
  async getCategories(onlyActive = true) {
    return prisma.category.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });
  }

  async getMenuItems(params: {
    categorySlug?: string;
    categoryId?: string;
    search?: string;
    onlyAvailable?: boolean;
  }) {
    const { categorySlug, categoryId, search, onlyAvailable = false } = params;

    const where: Prisma.MenuItemWhereInput = {};

    if (onlyAvailable) {
      where.isAvailable = true;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title_ar: { contains: q, mode: 'insensitive' } },
        { title_en: { contains: q, mode: 'insensitive' } },
        { description_ar: { contains: q, mode: 'insensitive' } },
        { description_en: { contains: q, mode: 'insensitive' } },
      ];
    }

    return prisma.menuItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name_ar: true, name_en: true, slug: true },
        },
      },
    });
  }

  async getMenuItemById(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async createMenuItem(data: {
    categoryId: string;
    title_ar: string;
    title_en?: string;
    description_ar?: string;
    description_en?: string;
    price: number | string;
    imageUrl?: string;
    isAvailable?: boolean;
  }) {
    return prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        title_ar: data.title_ar,
        title_en: data.title_en || data.title_ar,
        description_ar: data.description_ar || '',
        description_en: data.description_en || '',
        price: new Prisma.Decimal(data.price),
        imageUrl: data.imageUrl || '/assets/dishes/hamam_mahshi_dish.jpg',
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      },
      include: {
        category: true,
      },
    });
  }

  async updateMenuItem(
    id: string,
    data: {
      categoryId?: string;
      title_ar?: string;
      title_en?: string;
      description_ar?: string;
      description_en?: string;
      price?: number | string;
      imageUrl?: string;
      isAvailable?: boolean;
    }
  ) {
    const updateData: Prisma.MenuItemUpdateInput = {};

    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.title_ar !== undefined) updateData.title_ar = data.title_ar;
    if (data.title_en !== undefined) updateData.title_en = data.title_en;
    if (data.description_ar !== undefined) updateData.description_ar = data.description_ar;
    if (data.description_en !== undefined) updateData.description_en = data.description_en;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

    return prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async deleteMenuItem(id: string) {
    return prisma.menuItem.delete({
      where: { id },
    });
  }

  async createCategory(data: { name_ar: string; name_en?: string; slug?: string; orderIndex?: number }) {
    const slug = data.slug || data.name_en?.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`;
    return prisma.category.create({
      data: {
        name_ar: data.name_ar,
        name_en: data.name_en || data.name_ar,
        slug,
        orderIndex: data.orderIndex || 0,
        isActive: true,
      },
    });
  }

  async updateCategory(id: string, data: { name_ar?: string; name_en?: string; orderIndex?: number; isActive?: boolean }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const menuService = new MenuService();
