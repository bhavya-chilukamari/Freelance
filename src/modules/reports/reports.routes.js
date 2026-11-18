import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ReportsController.getReports);

export default router;

