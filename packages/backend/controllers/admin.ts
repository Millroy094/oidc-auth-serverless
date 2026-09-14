import { Request, Response } from 'express';
import { AnyItem } from 'dynamoose/dist/Item';
import logger from '../utils/logger.ts';
import ClientService from '../services/client.ts';
import MFAService from '../services/mfa/index.ts';
import OIDCService from '../services/oidc.ts';
import UserService from '../services/user.ts';
import HTTP_STATUSES from '../constants/http-status.ts';

class AdminController {
  public static async createClient(req: Request, res: Response) {
    try {
      await ClientService.createClient(req.body);
      res
        .json({ message: 'Successfully registered client!' })
        .status(HTTP_STATUSES.ok);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed registering client' });
    }
  }

  public static async getClients(req: Request, res: Response) {
    try {
      const clients = await ClientService.getClients();

      const results = clients.map((client: AnyItem) => ({
        id: client.id,
        clientId: client.clientId,
        clientName: client.clientName,
        secret: client.secret,
      }));

      res
        .json({ results, message: 'Successfully retrieved clients!' })
        .status(HTTP_STATUSES.ok);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed retrieve clients' });
    }
  }

  public static async getClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clientRecord = await ClientService.getClientById(id);
      res.status(HTTP_STATUSES.ok).json({ client: clientRecord });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue fetching client info' });
    }
  }

  public static async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ClientService.updateClient(id, req.body);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully updated client record!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue updating client record' });
    }
  }

  public static async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ClientService.deleteClients(id);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully deleted client record!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue deleting client' });
    }
  }

  public static async getUsers(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;

      const users = await UserService.getUsers();

      const results = users
        .map((user: AnyItem) => ({
          id: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          roles: [],
        }))
        .filter((user) => user.id !== currentUserId);

      res
        .json({ results, message: 'Successfully retrieved users!' })
        .status(HTTP_STATUSES.ok);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed retrieve users' });
    }
  }

  public static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully deleted user record!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue deleting user' });
    }
  }

  public static async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRecord = await UserService.getUserById(id);
      res.status(HTTP_STATUSES.ok).json({ user: userRecord });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue fetching user info' });
    }
  }

  public static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!req.body.suspended) {
        req.body.failedLogins = 0;
      }

      await UserService.updateUser(id, req.body);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully updated user record!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue updating user info' });
    }
  }

  public static async deleteUserSessions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await OIDCService.deleteAllSessions(id);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully deleted all user sessions!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue deleting user session' });
    }
  }

  public static async resetMFA(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await MFAService.resetMFA(id);
      res.status(HTTP_STATUSES.ok).json({ message: 'Successfully reset MFA!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed to reset MFA' });
    }
  }
}

export default AdminController;
