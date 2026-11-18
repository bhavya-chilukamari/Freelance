import { Router } from 'express';
import { MilestonesController } from './milestones.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

// Router for individual milestone operations (/api/milestones/:id)
const milestonesRouter = Router();
milestonesRouter.use(authenticate);

milestonesRouter.put('/:id', MilestonesController.update);
milestonesRouter.patch('/:id/toggle', MilestonesController.toggleStatus);
milestonesRouter.delete('/:id', MilestonesController.delete);

// Router for project-nested milestone operations (/api/projects/:projectId/milestones)
export const projectMilestonesRoutes = Router({ mergeParams: true });
projectMilestonesRoutes.use(authenticate);

projectMilestonesRoutes.get('/', MilestonesController.getByProject);
projectMilestonesRoutes.post('/', MilestonesController.create);

export default milestonesRouter;
