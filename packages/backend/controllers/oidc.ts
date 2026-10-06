import { Request, Response } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';
import UserService from '../services/user.ts';
import { AuthenticationService } from '../services/authentication.ts';
import {
  ChallengeResponseUser,
  respondEmailVerificationRequired,
  respondMfaRequired,
} from '../utils/auth-helper.ts';
import {
  getOidcErrorMessage,
  isOidcProviderError,
} from '../utils/oidc-error.ts';

export interface PasswordStageAuthenticateInteractionBody {
  email: string;
  password: string;
  captchaToken: string;
  stage: 'PASSWORD';
}

export interface MfaStageAuthenticateInteractionBody {
  email: string;
  otp: string;
  stage: 'MFA';
}

export interface RecoveryCodeStageAuthenticateInteractionBody {
  email: string;
  recoveryCode: string;
  resetMfa?: boolean;
  stage: 'RECOVERY_CODE';
}

export type AuthenticateInteractionBody =
  | PasswordStageAuthenticateInteractionBody
  | MfaStageAuthenticateInteractionBody
  | RecoveryCodeStageAuthenticateInteractionBody;

export interface AuthorizeInteractionBody {
  authorize: boolean;
}

class OIDCController {
  public static async authenticateInteraction(
    req: Request<Record<string, string>, unknown, AuthenticateInteractionBody>,
    res: Response,
  ) {
    try {
      const interactionDetails = await req.oidcProvider.interactionDetails(
        req,
        res,
      );

      if (interactionDetails.prompt.name !== 'login') {
        throw new Error('Interaction is not at login stage');
      }

      await AuthenticationService.authenticateByStage(req.body, (user) =>
        this.respondOidcLoginSuccess(res, req, user),
      );
    } catch (err) {
      if ((err as Error).message === 'Interaction is not at login stage') {
        return this.respondOidcError(res, req, {
          error: 'access_denied',
          error_description: 'Username or password is incorrect.',
        });
      }

      if (isOidcProviderError(err)) {
        return res.status(HTTP_STATUSES.badRequest).json({
          error: `Unable to process authentication: ${getOidcErrorMessage(err)}`,
        });
      }

      const errorMessage = (err as Error).message;

      if (errorMessage === 'EMAIL_VERIFICATION_REQUIRED') {
        const user = await UserService.getUserByEmail(req.body.email);
        if (user) {
          return respondEmailVerificationRequired(res, user);
        }
      }

      if (errorMessage === 'MFA_REQUIRED') {
        const user = await UserService.getUserByEmail(req.body.email);
        if (user) {
          return respondMfaRequired(res, user);
        }
      }

      const errorMsg = AuthenticationService.getErrorMessage(errorMessage);
      res.status(HTTP_STATUSES.unauthorised).json({ error: errorMsg });
    }
  }

  private static async respondOidcLoginSuccess(
    res: Response,
    req: Request,
    user: ChallengeResponseUser,
  ): Promise<void> {
    const result = {
      login: {
        accountId: user.userId,
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
    res.status(HTTP_STATUSES.ok).json({
      challengeName: 'LOGIN_SUCCESS',
      redirect,
      message: 'Login successful!',
    });
  }

  private static async respondOidcError(
    res: Response,
    req: Request,
    errorResult: Record<string, unknown>,
  ): Promise<void> {
    const redirect = await req.oidcProvider.interactionResult(
      req,
      res,
      errorResult,
      { mergeWithLastSubmission: false },
    );
    res.status(HTTP_STATUSES.ok).json({ redirect });
  }

  public static async authorizeInteraction(
    req: Request<Record<string, string>, unknown, AuthorizeInteractionBody>,
    res: Response,
  ) {
    let result: Record<string, unknown>;
    try {
      const { authorize } = req.body;
      const interactionDetails = await req.oidcProvider.interactionDetails(
        req,
        res,
      );
      const {
        prompt: { name, details },
        params,
        session,
      } = interactionDetails;

      if (name !== 'consent') {
        throw new Error('Interaction is not at consent stage');
      }

      if (!authorize) {
        throw new Error('User does not authorize this request');
      }

      const accountId = session?.accountId;

      const grant = interactionDetails.grantId
        ? await req.oidcProvider.Grant.find(interactionDetails.grantId)
        : new req.oidcProvider.Grant({
            accountId,
            clientId: params.client_id as string,
          });

      if (grant) {
        if (details.missingOIDCScope) {
          grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims as string[]);
        }
        if (details.missingResourceScopes) {
          const account = accountId
            ? await UserService.getUserById(accountId, ['resources'])
            : undefined;

          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes as Record<string, string[]>,
          )) {
            const userGrant = account?.resources?.find(
              (entry) => entry.id === indicator,
            );
            const allowedScopes = scopes.filter((scope) =>
              userGrant?.scopes.includes(scope),
            );

            if (allowedScopes.length) {
              grant.addResourceScope(indicator, allowedScopes.join(' '));
            }
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
      } else if (isOidcProviderError(err)) {
        // interactionDetails() failed, so there's no valid interaction left
        // to call interactionResult() against.
        res.status(HTTP_STATUSES.badRequest).json({
          error: `Unable to process authentication: ${getOidcErrorMessage(err)}`,
        });
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
