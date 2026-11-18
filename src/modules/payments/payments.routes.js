import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', PaymentsController.getPayments);
router.get('/:id', PaymentsController.getPaymentById);
router.post('/', PaymentsController.createPayment);
router.put('/:id', PaymentsController.updatePayment);
router.patch('/:id/status', PaymentsController.updateStatus);
router.delete('/:id', PaymentsController.deletePayment);

export default router;

