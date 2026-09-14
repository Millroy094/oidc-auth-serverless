import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { Request, Response } from 'express';
import User from '../models/User.ts';
import logger from '../utils/logger.ts';
import config from '../support/env-config.ts';
import HTTP_STATUSES from '../constants/http-status.ts';
import UserService from '../services/user.ts';
import PasskeyService from '../services/passkey.ts';

class PasskeyController {
  public static async getPasskeys(req: Request, res: Response) {
    try {
      const userId = req.query.userId;
      const user = await User.get(userId as string);

      const deviceNames = user.mfa.passkey.credentials.map(
        (credentials: { deviceName: string }) => credentials.deviceName,
      );

      res.status(HTTP_STATUSES.ok).send({
        messages: 'Successfully retrieved passkey device names',
        deviceNames,
        verified: user.mfa.passkey.verified,
      });
    } catch (error) {
      logger.error(
        `Failed to retrieve registered passkeys: ${(error as Error).message}`,
      );
      res
        .status(HTTP_STATUSES.badRequest)
        .send({ error: 'There was an issue retrieving pass keys' });
    }
  }

  public static async deletePasskey(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      const deviceName = req.body.deviceName;
      const user = await User.get(userId as string);

      user.mfa.passkey.credentials = user.mfa.passkey.credentials.filter(
        (credential: { deviceName: string }) =>
          credential.deviceName !== deviceName,
      );

      if (
        user.mfa.passkey.credentials.length === 0 &&
        user.mfa.preference === 'passkey'
      ) {
        user.mfa.preference = '';
        user.mfa.passkey.verified = false;
      }

      await user.save();

      res.status(HTTP_STATUSES.ok).send({
        messages: 'Successfully deleted passkey',
      });
    } catch (error) {
      logger.error(`Failed to delete passkey: ${(error as Error).message}`);
      res
        .status(HTTP_STATUSES.badRequest)
        .send({ error: 'There was an issue deleting passkey' });
    }
  }

  public static async registerPasskey(req: Request, res: Response) {
    try {
      const userId = req.body.userId;

      const user = await User.get(userId);

      const options = await generateRegistrationOptions({
        rpID: req.hostname,
        rpName: config.get('authentication.issuer'),
        userName: userId,
        userDisplayName: user.email,
        attestationType: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
      });

      await PasskeyService.createChallenge(userId, options.challenge);

      await user.save();
      res.status(HTTP_STATUSES.ok).send({ options });
    } catch (error) {
      logger.error(`Failed passkey registration ${(error as Error).message}`);
      res
        .status(HTTP_STATUSES.badRequest)
        .send({ error: 'There was an issue registering for passkey' });
    }
  }

  public static async verifyPasskeyRegistration(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      const user = await User.get(userId);
      const { challenge: signedChallenge } = PasskeyService.decodeClientData(
        req.body.credential.response.clientDataJSON,
      );
      const storedChallenge = await PasskeyService.retrieveChallenge(
        userId,
        signedChallenge,
      );

      if (!storedChallenge) {
        throw new Error('Unable to find challenge');
      }

      const verification = await verifyRegistrationResponse({
        response: req.body.credential,
        expectedChallenge: storedChallenge,
        expectedOrigin:
          req.headers.origin ?? `${req.protocol}://${req.hostname}`,
        expectedRPID: req.hostname,
      });

      if (verification.verified) {
        user.mfa.passkey.credentials.push({
          id: verification?.registrationInfo?.credential?.id,
          publicKey: Buffer.from(
            verification?.registrationInfo?.credential?.publicKey ?? '',
          ),
          counter: verification?.registrationInfo?.credential?.counter,
          deviceName: req.body.deviceName,
        });

        await PasskeyService.deleteChallenge(userId, storedChallenge);

        user.mfa.passkey.verified = true;

        if (!user.mfa.preference) {
          user.mfa.preference = 'passkey';
        }

        await user.save();

        res.status(HTTP_STATUSES.ok).send({ verified: true });
      } else {
        res.status(HTTP_STATUSES.unauthorised).send({ verified: false });
      }
    } catch (error) {
      logger.error(
        `Failed verifying passkey registration ${(error as Error).message}`,
      );
      res
        .status(HTTP_STATUSES.badRequest)
        .send({ error: 'There was an issue verifying passkey registration' });
    }
  }

  public static async loginWithPasskey(req: Request, res: Response) {
    try {
      const userEmail = req.body.email;
      const user = await UserService.getUserByEmail(userEmail);

      const options = await generateAuthenticationOptions({
        rpID: req.hostname,
        allowCredentials:
          user?.credentials?.map((cred: { id: string }) => ({
            id: cred.id,
            type: 'public-key',
          })) ?? [],
        userVerification: 'required',
      });

      await PasskeyService.createChallenge(user.userId, options.challenge);

      res.status(HTTP_STATUSES.ok).send({ options });
    } catch (error) {
      logger.error(
        `Failed retrieving login credentials for passkey ${(error as Error).message}`,
      );
      res
        .status(HTTP_STATUSES.badRequest)
        .send({ error: 'There was an issue with passkey login' });
    }
  }

  public static async verifyLoginPasskey(req: Request, res: Response) {
    try {
      const userEmail = req.body.email;
      const user = await UserService.getUserByEmail(userEmail);

      const credential = user.mfa.passkey.credentials.find(
        (cred: { id: string }) => cred.id === req.body.credential.id,
      );

      if (!credential) {
        throw new Error('Could not find a passkey');
      }

      const { challenge: signedChallenge } = PasskeyService.decodeClientData(
        req.body.credential.response.clientDataJSON,
      );
      const storedChallenge = await PasskeyService.retrieveChallenge(
        user.userId,
        signedChallenge,
      );

      if (!storedChallenge) {
        throw new Error('Unable to find challenge');
      }

      const verification = await verifyAuthenticationResponse({
        response: req.body.credential,
        expectedChallenge: storedChallenge,
        expectedOrigin:
          req.headers.origin ?? `${req.protocol}://${req.hostname}`,
        expectedRPID: req.hostname,
        credential: {
          id: credential.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
        },
      });

      if (verification.verified) {
        user.mfa.passkey.credentials = user.mfa.passkey.credentials.map(
          (cred: { id: string }) =>
            req.body.credential.id === cred.id
              ? { ...cred, counter: verification.authenticationInfo.newCounter }
              : cred,
        );

        await PasskeyService.deleteChallenge(user.userId, storedChallenge);

        await user.save();
        res.status(HTTP_STATUSES.ok).send({ verified: true });
      } else {
        res.status(HTTP_STATUSES.ok).send({ verified: false });
      }
    } catch (error) {
      logger.error(
        `Failed verifying login credentials for passkey ${(error as Error).message}`,
      );
      res
        .status(HTTP_STATUSES.badRequest)
        .send({ error: 'There was an issue with passkey login' });
    }
  }

  public static async checkPasskeyExists(req: Request, res: Response) {
    const { userId, deviceName } = req.body;

    try {
      const user = await User.get(userId);
      if (user?.mfa?.passkey?.credentials) {
        const existingCredential = user.mfa.passkey.credentials.find(
          (credential: { deviceName: string }) =>
            credential.deviceName === deviceName,
        );
        res.status(200).send({ exists: !!existingCredential });
        return;
      }

      res.status(200).send({ exists: false });
    } catch (error) {
      console.error('Error checking passkey:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
  }
}

export default PasskeyController;
