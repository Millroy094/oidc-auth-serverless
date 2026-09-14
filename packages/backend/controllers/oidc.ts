import { Request, Response } from 'express';
import logger from '../utils/logger.ts';
import UserService from '../services/user.ts';
import MFAService from '../services/mfa/index.ts';
import HTTP_STATUSES from '../constants/http-status.ts';

class OIDCController {
  public static async getInteractionStatus(req: Request, res: Response) {
    try {
      const {
        prompt: { name },
      } = await req.oidcProvider.interactionDetails(req, res);
      res.status(HTTP_STATUSES.ok).json({ status: name });
    } catch (err) {
      logger.error((err as Error).message);
      res
        .status(HTTP_STATUSES.badRequest)
        .json({ error: `Unable to process authentication: ${err}` });
    }
  }

  public static async authenticateInteraction(req: Request, res: Response) {
    let result = {};
    try {
      const interactionDetails = await req.oidcProvider.interactionDetails(
        req,
        res,
      );
      const {
        prompt: { name },
      } = interactionDetails;

      if (name !== 'login') {
        throw new Error('Interaction is not at login stage');
      }

      const userAccount = await UserService.validateUserCredentials(
        req.body.email,
        req.body.password,
      );

      if (!userAccount.emailVerified && req.body.otp) {
        await UserService.verifyEmail(userAccount.userId, req.body.otp);
      } else if (req.body.loginWithRecoveryCode && req.body.recoveryCode) {
        await MFAService.validateRecoveryCode(
          userAccount.userId,
          req.body.recoveryCode,
          req.body.resetMfa,
        );
      } else if (userAccount.mfa.preference && req.body.otp) {
        await MFAService.verifyMFA(
          userAccount.userId,
          userAccount.mfa.preference,
          req.body.otp,
        );
      }

      result = {
        login: {
          accountId: userAccount.userId,
        },
      };
      const redirect = await req.oidcProvider.interactionResult(
        req,
        res,
        result,
        {
          mergeWithLastSubmission: false,
        },
      );
      res
        .status(HTTP_STATUSES.ok)
        .json({ redirect, message: 'Login successful!' });
    } catch (err) {
      console.log(err);
      if ((err as Error).message === 'Interaction is not at login stage') {
        result = {
          error: 'access_denied',
          error_description: 'Username or password is incorrect.',
        };
        const redirect = await req.oidcProvider.interactionResult(
          req,
          res,
          result,
          {
            mergeWithLastSubmission: false,
          },
        );
        res.status(HTTP_STATUSES.ok).json({ redirect });
      } else {
        res
          .status(HTTP_STATUSES.unauthorised)
          .json({ error: 'Invalid email or password' });
      }
    }
  }

  public static async authorizeInteraction(req: Request, res: Response) {
    let result = {};
    try {
      const { authorize } = req.body;
      const interactionDetails = await req.oidcProvider.interactionDetails(
        req,
        res,
      );
      const {
        prompt: { name, details },
        params,
        session: { accountId },
      } = interactionDetails;

      if (name !== 'consent') {
        throw new Error('Interaction is not at consent stage');
      }

      if (!authorize) {
        throw new Error('User does not authorize this request');
      }

      const grant = interactionDetails.grantId
        ? await req.oidcProvider.Grant.find(interactionDetails.grantId)
        : new req.oidcProvider.Grant({
            accountId,
            clientId: params.client_id as string,
          });

      if (grant) {
        if (details.missingOIDCScope) {
          grant.addOIDCScope(details.missingOIDCScope.join(' '));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes,
          )) {
            grant.addResourceScope(indicator, (scopes as string[]).join(' '));
          }
        }

        const grantId = await grant.save();

        const result = { consent: { grantId } };
        const redirect = await req.oidcProvider.interactionResult(
          req,
          res,
          result,
          {
            mergeWithLastSubmission: true,
          },
        );
        res
          .json({ redirect, message: 'Authorisation successful!' })
          .status(HTTP_STATUSES.ok);
      }
    } catch (err) {
      console.log(err);
      if (
        [
          'Interaction is not at consent stage',
          'User does not authorize this request',
        ].includes((err as Error).message)
      ) {
        result = {
          error: 'access_denied',
          error_description: 'Authorisation failed.',
        };
        const redirect = await req.oidcProvider.interactionResult(
          req,
          res,
          result,
          {
            mergeWithLastSubmission: false,
          },
        );
        res.status(HTTP_STATUSES.ok).json({ redirect });
      } else {
        res
          .status(HTTP_STATUSES.unauthorised)
          .json({ error: 'Authorisation failed' });
      }
    }
  }

  public static async setupOidc(req: Request, res: Response) {
    const cb = req.oidcProvider.callback();
    return cb(req, res);
  }
}

export default OIDCController;
