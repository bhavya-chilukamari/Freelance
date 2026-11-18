import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.put('/profile', UsersController.updateProfile);
router.put('/password', UsersController.updatePassword);

export default router;

