import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationsController.getNotifications);
router.patch('/:id/read', NotificationsController.markAsRead);
router.patch('/read-all', NotificationsController.markAllAsRead);
router.post('/check-triggers', NotificationsController.checkTriggers);

export default router;

