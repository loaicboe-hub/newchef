import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_PATH)) {
  fs.mkdirSync(env.UPLOAD_PATH, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('صيغة الصورة غير مدعومة. الصيغ المسموحة: JPG, PNG, WEBP'));
  }
};

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter,
}).single('image');

/**
 * Optimizes the uploaded image buffer using Sharp, converts to webp,
 * writes to disk, and injects `req.fileUrl` into Request.
 */
export const optimizeAndSaveImage = async (
  req: Request & { fileUrl?: string },
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      return next();
    }

    const filename = `dish-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(env.UPLOAD_PATH, filename);

    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    req.fileUrl = `/uploads/${filename}`;
    next();
  } catch (err) {
    next(err);
  }
};
