import { Router } from 'express';
import { ClientsController } from './clients.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Protect all client routes
router.use(authenticate);

router.get('/', ClientsController.getClients);
router.get('/:id', ClientsController.getClientById);
router.post('/', ClientsController.createClient);
router.put('/:id', ClientsController.updateClient);
router.delete('/:id', ClientsController.deleteClient);

export default router;

