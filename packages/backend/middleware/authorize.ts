import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.ts';
import UserService from '../services/user.ts';

const authorize = (permissions: string[] | undefined) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (permissions && permissions.length > 0) {
      try {
        if (!req.user) {
          res.status(401).json({
            error: 'Authorisation failed! user not authenticated',
          });
          return;
        }

        const userId = req.user?.userId ?? '';

        const userAccount = await UserService.getUserById(userId);

        const hasPermissions = permissions.every((permission: string) =>
          userAccount.roles.includes(permission),
        );

        if (!hasPermissions) {
          throw new Error(
            "Authorisation failed! user doesn't have sufficient permissions to carry out this task",
          );
        }
      } catch (error) {
        logger.error((error as Error).message);
        res.status(403).json({
          error:
            "Authorisation failed! user doesn't have sufficient permissions to carry out this task",
        });
        return;
      }
    }
    next();
  };
};

export default authorize;
