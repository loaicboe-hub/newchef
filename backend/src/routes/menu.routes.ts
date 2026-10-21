import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router = Router();

router.get('/categories', menuController.getCategories);
router.get('/menu', menuController.getMenuItems);

export default router;
