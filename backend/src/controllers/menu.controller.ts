import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';

export class MenuController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.all !== 'true';
      const categories = await menuService.getCategories(onlyActive);
      res.json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, categoryId, search, available } = req.query;
      const items = await menuService.getMenuItems({
        categorySlug: category as string,
        categoryId: categoryId as string,
        search: search as string,
        onlyAvailable: available === 'true',
      });
      res.json({
        success: true,
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  async createMenuItem(req: Request & { fileUrl?: string }, res: Response, next: NextFunction) {
    try {
      const { categoryId, title_ar, title_en, description_ar, description_en, price, isAvailable, imageUrl } = req.body;

      const finalImageUrl = req.fileUrl || imageUrl;

      const item = await menuService.createMenuItem({
        categoryId,
        title_ar,
        title_en,
        description_ar,
        description_en,
        price,
        imageUrl: finalImageUrl,
        isAvailable: isAvailable === undefined ? true : String(isAvailable) === 'true',
      });

      res.status(201).json({
        success: true,
        message: 'تم إضافة الصنف للمنيو بنجاح',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateMenuItem(req: Request & { fileUrl?: string }, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { categoryId, title_ar, title_en, description_ar, description_en, price, isAvailable, imageUrl } = req.body;

      const finalImageUrl = req.fileUrl || imageUrl;

      const item = await menuService.updateMenuItem(id, {
        categoryId,
        title_ar,
        title_en,
        description_ar,
        description_en,
        price,
        imageUrl: finalImageUrl,
        isAvailable: isAvailable === undefined ? undefined : String(isAvailable) === 'true',
      });

      res.json({
        success: true,
        message: 'تم تحديث الصنف بنجاح',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await menuService.deleteMenuItem(id);
      res.json({
        success: true,
        message: 'تم حذف الصنف بنجاح',
      });
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name_ar, name_en, slug, orderIndex } = req.body;
      const category = await menuService.createCategory({
        name_ar,
        name_en,
        slug,
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
      });
      res.status(201).json({
        success: true,
        message: 'تم إنشاء القسم بنجاح',
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name_ar, name_en, orderIndex, isActive } = req.body;
      const category = await menuService.updateCategory(id, {
        name_ar,
        name_en,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : undefined,
        isActive: isActive !== undefined ? String(isActive) === 'true' : undefined,
      });
      res.json({
        success: true,
        message: 'تم تحديث القسم بنجاح',
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await menuService.deleteCategory(id);
      res.json({
        success: true,
        message: 'تم حذف القسم بنجاح',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const menuController = new MenuController();
