import { Request, Response, NextFunction } from 'express';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/authentication.ts';
import UserService from '../services/user.ts';
import config from '../support/env-config.ts';
import { signJwt, verifyJwt, isJwtExpiredError } from '../utils/jwt.ts';
import logger from '../utils/logger.ts';

const accessTokenSecret = config.get('authentication.accessTokenSecret');
const accessTokenExpiry = config.get('authentication.accessTokenExpiry');
const refreshTokenSecret = config.get('authentication.refreshTokenSecret');
const refreshTokenExpiry = config.get('authentication.accessTokenExpiry');

const generateNewTokensFromRefreshToken = async (
  refreshToken: string,
  req: Request,
  res: Response,
) => {
  try {
    const { userId, email } = await verifyJwt(refreshToken, refreshTokenSecret);
    const newAccessToken = await signJwt(
      { userId, email },
      accessTokenSecret,
      accessTokenExpiry,
    );
    const newRefreshToken = await signJwt(
      { userId, email },
      accessTokenSecret,
      refreshTokenExpiry,
    );

    res
      .cookie(ACCESS_TOKEN, newAccessToken, {
        httpOnly: true,
        secure: config.get('deploymentEnvironment') !== 'local',
      })
      .cookie(REFRESH_TOKEN, newRefreshToken, {
        httpOnly: true,
        secure: config.get('deploymentEnvironment') !== 'local',
      });

    req.user = { userId, email };
  } catch {
    throw new Error(
      'Authentication failed, authentication tokens have expired',
    );
  }
};

const validateTokensFromCookies = async (req: Request, res: Response) => {
  const accessToken = req?.cookies[ACCESS_TOKEN] as string | undefined;
  const refreshToken = req?.cookies[REFRESH_TOKEN] as string | undefined;

  if (!accessToken || !refreshToken) {
    throw new Error(
      'Authentication failed, authentication tokens missing from header cookies',
    );
  }

  try {
    const { userId, email } = await verifyJwt(accessToken, accessTokenSecret);

    req.user = { userId, email };
  } catch (error) {
    if (isJwtExpiredError(error)) {
      await generateNewTokensFromRefreshToken(refreshToken, req, res);
    } else {
      logger.error((error as Error).message);
      throw new Error('Authentication failed, for an unexpected reason');
    }
  }
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await validateTokensFromCookies(req, res);

    const userAccount = await UserService.getUserById(req.user?.userId ?? '');

    if (userAccount.suspended) {
      throw new Error('Authentication failed! User is suspended');
    }
    return next();
  } catch (err) {
    logger.error((err as Error).message);
    res.status(401).json({
      error: 'Authentication failed, please check if you are still logged in',
    });
  }
};

export default authenticate;
