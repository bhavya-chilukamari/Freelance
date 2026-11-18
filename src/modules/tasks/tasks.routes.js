import { Router } from 'express';
import { TasksController } from './tasks.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', TasksController.getTasks);
router.get('/:id', TasksController.getTaskById);
router.post('/', TasksController.createTask);
router.put('/:id', TasksController.updateTask);
router.patch('/:id/status', TasksController.updateStatus);
router.delete('/:id', TasksController.deleteTask);

export default router;

