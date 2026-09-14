import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.ts';
import UserService from '../services/user.ts';
import config from '../support/env-config.ts';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/authentication.ts';

interface JwtPayload {
  userId: string;
  email: string;
}

const accessTokenSecret = config.get('authentication.accessTokenSecret');
const accessTokenExpiry = config.get('authentication.accessTokenExpiry');
const refreshTokenSecret = config.get('authentication.refreshTokenSecret');
const refreshTokenExpiry = config.get('authentication.accessTokenExpiry');

const generateNewTokensFromRefreshToken = (
  refreshToken: string,
  req: Request,
  res: Response,
) => {
  try {
    const { userId, email } = jwt.verify(
      refreshToken,
      refreshTokenSecret,
    ) as JwtPayload;
    const newAccessToken = jwt.sign({ userId, email }, accessTokenSecret, {
      expiresIn: accessTokenExpiry,
    });
    const newRefreshToken = jwt.sign({ userId, email }, accessTokenSecret, {
      expiresIn: refreshTokenExpiry,
    });

    res
      .cookie(ACCESS_TOKEN, newAccessToken, {
        httpOnly: true,
        secure: config.get('env') === 'production',
      })
      .cookie(REFRESH_TOKEN, newRefreshToken, {
        httpOnly: true,
        secure: config.get('env') === 'production',
      });

    req.user = { userId, email };
  } catch (error) {
    throw new Error(
      'Authentication failed, authentication tokens have expired',
    );
  }
};

const validateTokensFromCookies = (req: Request, res: Response) => {
  const accessToken = req?.cookies[ACCESS_TOKEN];
  const refreshToken = req?.cookies[REFRESH_TOKEN];

  if (!accessToken || !refreshToken) {
    throw new Error(
      'Authentication failed, authentication tokens missing from header cookies',
    );
  }

  try {
    const { userId, email } = jwt.verify(
      accessToken,
      accessTokenSecret,
    ) as JwtPayload;

    req.user = { userId, email };
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      generateNewTokensFromRefreshToken(refreshToken, req, res);
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
    validateTokensFromCookies(req, res);

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
