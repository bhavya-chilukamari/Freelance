import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ProjectsController.getProjects);
router.get('/:id', ProjectsController.getProjectById);
router.post('/', ProjectsController.createProject);
router.put('/:id', ProjectsController.updateProject);
router.delete('/:id', ProjectsController.deleteProject);

export default router;

