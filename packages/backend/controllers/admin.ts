import { Request, Response } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';
import { ResourceScope } from '../models/Resource.ts';
import ClientService from '../services/client.ts';
import MFAService from '../services/mfa/index.ts';
import OIDCService from '../services/oidc.ts';
import ResourceService, { ResourceInUseError } from '../services/resource.ts';
import SettingsService, { TtlSettings } from '../services/settings.ts';
import UserService from '../services/user.ts';
import logger from '../utils/logger.ts';
import decodePathParam from '../utils/path-param.ts';

export interface IdParams {
  [key: string]: string;
  id: string;
}

export interface CreateClientBody {
  clientId: string;
  clientName: string;
  scopes: string[];
  grants: string[];
  redirectUris: string[];
  requirePkce?: boolean;
}

export interface UpdateClientBody {
  clientId?: string;
  clientName?: string;
  scopes?: string[];
  grants?: string[];
  redirectUris?: string[];
  resources?: ResourceScope[];
  requirePkce?: boolean;
  [key: string]: unknown;
}

export interface CreateUserBody {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  roles?: string[];
  resources?: ResourceScope[];
}

export interface UpdateUserBody {
  suspended?: boolean;
  failedLogins?: number;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  roles?: string[];
  resources?: ResourceScope[];
  [key: string]: unknown;
}

export interface CreateResourceBody {
  id: string;
  name: string;
  scopes: string[];
}

export interface UpdateResourceBody {
  name?: string;
  scopes?: string[];
  [key: string]: unknown;
}

export type UpdateSettingsBody = Partial<TtlSettings> & {
  registrationEnabled?: boolean;
};

class AdminController {
  public static async createClient(
    req: Request<Record<string, string>, unknown, CreateClientBody>,
    res: Response,
  ) {
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

  public static async getClients(_req: Request, res: Response) {
    try {
      const clients = await ClientService.getClients();

      const results = clients.map((client) => ({
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

  public static async getClient(req: Request<IdParams>, res: Response) {
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

  public static async updateClient(
    req: Request<IdParams, unknown, UpdateClientBody>,
    res: Response,
  ) {
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

  public static async deleteClient(req: Request<IdParams>, res: Response) {
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

  public static async createUser(
    req: Request<Record<string, string>, unknown, CreateUserBody>,
    res: Response,
  ) {
    try {
      await UserService.createUser(req.body);

      try {
        await UserService.sendAccountCreatedNotification(
          req.body.email,
          req.body.firstName,
        );
      } catch (notificationErr) {
        // The user record was already created successfully - a failure to
        // send the notification email shouldn't be reported as a failure to
        // create the user.
        logger.error((notificationErr as Error).message);
      }

      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully created user!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed creating user' });
    }
  }

  public static async getUsers(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;

      const users = await UserService.getUsers();

      const results = users.map((user) => ({
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        roles: user.roles,
        isSelf: user.userId === currentUserId,
      }));

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

  public static async deleteUser(req: Request<IdParams>, res: Response) {
    try {
      const { id } = req.params;

      if (id === req.user?.userId) {
        res
          .status(HTTP_STATUSES.forbidden)
          .json({ error: 'You cannot delete your own account' });
        return;
      }

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

  public static async getUser(req: Request<IdParams>, res: Response) {
    try {
      const { id } = req.params;
      const userRecord = await UserService.getUserById(id, [
        'userId',
        'firstName',
        'lastName',
        'email',
        'emailVerified',
        'mobile',
        'roles',
        'suspended',
        'lastLoggedIn',
        'resources',
      ]);
      res.status(HTTP_STATUSES.ok).json({ user: userRecord });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue fetching user info' });
    }
  }

  public static async updateUser(
    req: Request<IdParams, unknown, UpdateUserBody>,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const isSelf = id === req.user?.userId;

      const targetUser = await UserService.getUserById(id);

      if (isSelf) {
        // Users can update their own profile but can never change their own
        // role via this endpoint - only another admin editing a different
        // account can do that.
        req.body.roles = targetUser?.roles ?? [];
      }

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

  public static async deleteUserSessions(
    req: Request<IdParams>,
    res: Response,
  ) {
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

  public static async resetMFA(req: Request<IdParams>, res: Response) {
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

  public static async createResource(
    req: Request<Record<string, string>, unknown, CreateResourceBody>,
    res: Response,
  ) {
    try {
      await ResourceService.createResource(req.body);
      res
        .json({ message: 'Successfully registered resource!' })
        .status(HTTP_STATUSES.ok);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed registering resource' });
    }
  }

  public static async getResources(_req: Request, res: Response) {
    try {
      const resources = await ResourceService.getResources();

      res
        .json({
          results: resources,
          message: 'Successfully retrieved resources!',
        })
        .status(HTTP_STATUSES.ok);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed retrieve resources' });
    }
  }

  public static async getResource(req: Request<IdParams>, res: Response) {
    try {
      const id = decodePathParam(req.params.id);
      const resourceRecord = await ResourceService.getResource(id);
      res.status(HTTP_STATUSES.ok).json({ resource: resourceRecord });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue fetching resource info' });
    }
  }

  public static async updateResource(
    req: Request<IdParams, unknown, UpdateResourceBody>,
    res: Response,
  ) {
    try {
      const id = decodePathParam(req.params.id);
      await ResourceService.updateResource(id, req.body);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully updated resource record!' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue updating resource record' });
    }
  }

  public static async deleteResource(req: Request<IdParams>, res: Response) {
    try {
      const id = decodePathParam(req.params.id);
      await ResourceService.deleteResource(id);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully deleted resource record!' });
    } catch (err) {
      logger.error((err as Error).message);

      if (err instanceof ResourceInUseError) {
        res.status(HTTP_STATUSES.conflict).json({ error: err.message });
        return;
      }

      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue deleting resource' });
    }
  }

  public static async getSettings(_req: Request, res: Response) {
    try {
      const [ttlSettings, registrationEnabled] = await Promise.all([
        SettingsService.getTtlSettings(),
        SettingsService.getRegistrationEnabled(),
      ]);
      res.status(HTTP_STATUSES.ok).json({
        settings: { ...ttlSettings, registrationEnabled },
        message: 'Successfully retrieved settings!',
      });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed retrieving settings' });
    }
  }

  public static async updateSettings(
    req: Request<Record<string, string>, unknown, UpdateSettingsBody>,
    res: Response,
  ) {
    try {
      const { registrationEnabled, ...ttlFields } = req.body;

      const [ttlSettings, updatedRegistrationEnabled] = await Promise.all([
        SettingsService.updateTtlSettings(ttlFields),
        registrationEnabled === undefined
          ? SettingsService.getRegistrationEnabled()
          : SettingsService.updateRegistrationEnabled(registrationEnabled),
      ]);

      res.status(HTTP_STATUSES.ok).json({
        settings: {
          ...ttlSettings,
          registrationEnabled: updatedRegistrationEnabled,
        },
        message: 'Successfully updated settings!',
      });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.badRequest)
        .json({ error: (err as Error).message });
    }
  }
}

export default AdminController;
