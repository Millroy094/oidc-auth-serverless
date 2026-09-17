import { Request, Response } from 'express';
import { pick } from 'lodash';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/authentication.ts';
import HTTP_STATUSES from '../constants/http-status.ts';
import MFAService from '../services/mfa/index.ts';
import OIDCService from '../services/oidc.ts';
import UserService from '../services/user.ts';
import config from '../support/env-config.ts';
import { signJwt } from '../utils/jwt.ts';
import logger from '../utils/logger.ts';

export interface RegisterBody {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
  otp?: string;
  loginWithRecoveryCode?: boolean;
  recoveryCode?: string;
  resetMfa?: boolean;
}

export interface SessionIdParams {
  [key: string]: string;
  sessionId: string;
}

export interface SetupMFABody {
  type: 'app' | 'sms' | 'email';
  subscriber: string;
}

export interface VerifyMFABody {
  type: 'app' | 'sms' | 'email';
  otp: string;
}

export interface ResetMFABody {
  type: 'app' | 'sms' | 'email';
}

export interface ChangeMFAPreferenceBody {
  preference: 'app' | 'sms' | 'email' | 'passkey' | '';
}

export interface SendOtpBody {
  type: string;
  email: string;
}

export interface LoginConfigurationQuery {
  [key: string]: string;
  email: string;
}

export interface ChangePasswordBody {
  email: string;
  otp: string;
  password: string;
}

class UserController {
  public static async register(
    req: Request<Record<string, string>, unknown, RegisterBody>,
    res: Response,
  ) {
    try {
      await UserService.createUser(req.body);
      res
        .json({ message: 'Successfully registered user!' })
        .status(HTTP_STATUSES.ok);
    } catch (err) {
      logger.error((err as Error).message);

      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed registering user' });
    }
  }

  public static async login(
    req: Request<Record<string, string>, unknown, LoginBody>,
    res: Response,
  ) {
    try {
      const user = await UserService.validateUserCredentials(
        req.body.email,
        req.body.password,
      );

      if (!user.emailVerified && req.body.otp) {
        await UserService.verifyEmail(user.userId, req.body.otp);
      } else if (req.body.loginWithRecoveryCode && req.body.recoveryCode) {
        await MFAService.validateRecoveryCode(
          user.userId,
          req.body.recoveryCode,
          req.body.resetMfa ?? false,
        );
      } else if (
        user.mfa.preference &&
        user.mfa.preference === 'passkey' &&
        req.body.otp
      ) {
        await MFAService.verifyMFA(
          user.userId,
          user.mfa.preference as 'app' | 'sms' | 'email',
          req.body.otp,
        );
      }

      const payload = {
        userId: user.userId,
        email: user.email,
        roles: user.roles,
      };

      const accessToken = await signJwt(
        payload,
        config.get('authentication.accessTokenSecret'),
        config.get('authentication.accessTokenExpiry'),
      );

      const refreshToken = await signJwt(
        payload,
        config.get('authentication.refreshTokenSecret'),
        config.get('authentication.refreshTokenExpiry'),
      );

      res
        .cookie(ACCESS_TOKEN, accessToken, {
          httpOnly: true,
          secure: config.get('deploymentEnvironment') !== 'local',
        })
        .cookie(REFRESH_TOKEN, refreshToken, {
          httpOnly: true,
          secure: config.get('deploymentEnvironment') !== 'local',
        })
        .status(200)
        .json({
          user: payload,
          message: 'Login Successful',
        });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.unauthorised)
        .json({ error: 'Invalid username or password' });
    }
  }

  public static logout(_req: Request, res: Response) {
    res
      .clearCookie(ACCESS_TOKEN)
      .clearCookie(REFRESH_TOKEN)
      .status(HTTP_STATUSES.ok)
      .json({
        message: 'Successfully logged out',
      });
  }

  public static async isAuthenticated(req: Request, res: Response) {
    try {
      const userAccount = await UserService.getUserById(req.user?.userId ?? '');

      res.status(HTTP_STATUSES.ok).json({
        user: { ...req.user, roles: userAccount?.roles ?? [] },
      });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue checking authentication status' });
    }
  }

  public static async getProfileDetails(req: Request, res: Response) {
    try {
      const { user } = req;
      const { userId } = user!;

      const userRecord = await UserService.getUserById(userId);
      res.status(HTTP_STATUSES.ok).json({ user: userRecord });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'There was an issue fetching user info' });
    }
  }

  public static async updateProfileDetails(req: Request, res: Response) {
    try {
      const { user } = req;
      const { userId } = user!;
      const allowedFields = pick(req.body, ['firstName', 'lastName', 'mobile']);
      await UserService.updateUser(userId, allowedFields);
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

  public static async getSessions(req: Request, res: Response) {
    try {
      const { user } = req;
      const { userId } = user!;
      const sessions = await OIDCService.getSessions(userId);
      res.status(HTTP_STATUSES.ok).json({ sessions });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'Unable to retreive user sessions' });
    }
  }

  public static async deleteAllSessions(req: Request, res: Response) {
    try {
      const { user } = req;
      const { userId } = user!;
      await OIDCService.deleteAllSessions(userId);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully deleted all user sessions' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Unable to delete user sessions' });
    }
  }

  public static async deleteSession(
    req: Request<SessionIdParams>,
    res: Response,
  ) {
    try {
      const { sessionId } = req.params;
      await OIDCService.deleteSession(sessionId);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully deleted all user sessions' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Unable to delete user sessions' });
    }
  }

  public static async getMFASettings(req: Request, res: Response) {
    try {
      const { user } = req;
      const { userId } = user!;
      const settings = await MFAService.getMFASetting(userId);
      res.status(HTTP_STATUSES.ok).json({ settings });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'Unable to retrieve user MFA settings' });
    }
  }
  public static async setupMFA(
    req: Request<Record<string, string>, unknown, SetupMFABody>,
    res: Response,
  ) {
    try {
      const { user } = req;
      const { userId } = user!;
      const { type, subscriber } = req.body;
      const result = await MFAService.setupMFA(userId, type, subscriber);
      res
        .status(HTTP_STATUSES.ok)
        .json({ uri: result?.uri, message: 'Initiated MFA Setup' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Unable to setup MFA' });
    }
  }

  public static async verifyMFA(
    req: Request<Record<string, string>, unknown, VerifyMFABody>,
    res: Response,
  ) {
    try {
      const { user } = req;
      const { userId } = user!;
      const { type, otp } = req.body;
      await MFAService.verifyMFA(userId, type, otp);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully verified MFA' });
    } catch (err) {
      logger.error((err as Error).message);
      res.status(HTTP_STATUSES.badRequest).json({ error: 'Invalid OTP' });
    }
  }

  public static async resetMFA(
    req: Request<Record<string, string>, unknown, ResetMFABody>,
    res: Response,
  ) {
    try {
      const { user } = req;
      const { userId } = user!;
      const { type } = req.body;
      await MFAService.resetMFAByType(userId, type);
      res.status(HTTP_STATUSES.ok).json({ message: 'Successfully reset MFA' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed to reset MFA' });
    }
  }

  public static async changeMFAPreference(
    req: Request<Record<string, string>, unknown, ChangeMFAPreferenceBody>,
    res: Response,
  ) {
    try {
      const { user } = req;
      const { userId } = user!;
      const { preference } = req.body;
      await MFAService.changePreference(userId, preference);
      res
        .status(HTTP_STATUSES.ok)
        .json({ message: 'Successfully changed MFA preference' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed to change MFA preference' });
    }
  }

  public static async generateRecoveryCodes(req: Request, res: Response) {
    try {
      const { user } = req;
      const { userId } = user!;

      const recoveryCodes = await MFAService.generateRecoveryCodes(userId);
      res.status(HTTP_STATUSES.ok).json({
        message: 'Successfully generated recovery codes',
        recoveryCodes,
      });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed to generate recovery codes' });
    }
  }

  public static async sendOtp(
    req: Request<Record<string, string>, unknown, SendOtpBody>,
    res: Response,
  ) {
    try {
      const { type, email } = req.body;

      if (type === 'email_verification') {
        await UserService.sendEmailVerificationOtp(email);
      } else if (type === 'forgot_password') {
        await UserService.sendPasswordResetOtp(email);
      } else {
        await MFAService.sendOtp(email, type as 'sms' | 'email');
      }
      res.status(HTTP_STATUSES.ok).json({ message: 'Successfully sent OTP' });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Failed to send OTP' });
    }
  }

  public static async getLoginConfiguration(
    req: Request<
      Record<string, string>,
      unknown,
      unknown,
      LoginConfigurationQuery
    >,
    res: Response,
  ) {
    try {
      const { email } = req.query;
      const loginConfiguration = await UserService.getLoginConfiguration(email);
      res.status(HTTP_STATUSES.ok).json(loginConfiguration);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'Failed to retrieve users login configuration' });
    }
  }

  public static async changePassword(
    req: Request<Record<string, string>, unknown, ChangePasswordBody>,
    res: Response,
  ) {
    try {
      const { email, otp, password } = req.body;
      const loginConfiguration = await UserService.changePassword(
        email,
        otp,
        password,
      );
      res.status(HTTP_STATUSES.ok).json(loginConfiguration);
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.notFound)
        .json({ error: 'Failed to change password' });
    }
  }
}

export default UserController;
