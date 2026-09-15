import { Router } from 'express';
import AdminController, {
  CreateClientBody,
  IdParams,
  UpdateClientBody,
  UpdateUserBody,
} from '../controllers/admin.ts';
import authenticate from '../middleware/authenticate.ts';
import authorize from '../middleware/authorize.ts';

const adminRouter = Router();

adminRouter.get('/clients', authenticate, authorize(['admin']), (req, res) =>
  AdminController.getClients(req, res),
);
adminRouter.post<Record<string, string>, unknown, CreateClientBody>(
  '/clients/new',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.createClient(req, res),
);
adminRouter.get<IdParams>(
  '/clients/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.getClient(req, res),
);
adminRouter.put<IdParams, unknown, UpdateClientBody>(
  '/clients/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.updateClient(req, res),
);
adminRouter.delete<IdParams>(
  '/clients/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.deleteClient(req, res),
);

adminRouter.get('/users', authenticate, authorize(['admin']), (req, res) =>
  AdminController.getUsers(req, res),
);
adminRouter.get<IdParams>(
  '/users/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.getUser(req, res),
);
adminRouter.put<IdParams, unknown, UpdateUserBody>(
  '/users/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.updateUser(req, res),
);
adminRouter.delete<IdParams>(
  '/users/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.deleteUser(req, res),
);
adminRouter.delete<IdParams>(
  '/users/:id/sessions',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.deleteUserSessions(req, res),
);

adminRouter.post<IdParams>(
  '/users/:id/mfa-reset',
  authenticate,
  authorize(['admin']),
  (req, res) => AdminController.resetMFA(req, res),
);

export default adminRouter;
