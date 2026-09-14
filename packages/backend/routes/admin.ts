import { Router } from 'express';
import AdminController from '../controllers/admin.ts';
import authenticate from '../middleware/authenticate.ts';
import authorize from '../middleware/authorize.ts';

const router = Router();

router.get(
  '/clients',
  authenticate,
  authorize(['admin']),
  AdminController.getClients,
);
router.post(
  '/clients/new',
  authenticate,
  authorize(['admin']),
  AdminController.createClient,
);
router.get(
  '/clients/:id',
  authenticate,
  authorize(['admin']),
  AdminController.getClient,
);
router.put(
  '/clients/:id',
  authenticate,
  authorize(['admin']),
  AdminController.updateClient,
);
router.delete(
  '/clients/:id',
  authenticate,
  authorize(['admin']),
  AdminController.deleteClient,
);

router.get(
  '/users',
  authenticate,
  authorize(['admin']),
  AdminController.getUsers,
);
router.get(
  '/users/:id',
  authenticate,
  authorize(['admin']),
  AdminController.getUser,
);
router.put(
  '/users/:id',
  authenticate,
  authorize(['admin']),
  AdminController.updateUser,
);
router.delete(
  '/users/:id',
  authenticate,
  authorize(['admin']),
  AdminController.deleteUser,
);
router.delete(
  '/users/:id/sessions',
  authenticate,
  authorize(['admin']),
  AdminController.deleteUserSessions,
);

router.post(
  '/users/:id/mfa-reset',
  authenticate,
  authorize(['admin']),
  AdminController.resetMFA,
);

export default router;
