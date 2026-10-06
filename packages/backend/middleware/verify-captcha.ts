import { Request, Response, NextFunction } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';
import config from '../support/env-config.ts';
import logger from '../utils/logger.ts';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const verifyCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const body = req.body as {
    captchaToken?: string;
    stage?: string;
  };
  const token = body?.captchaToken;
  const stage = body?.stage;
  const deploymentEnv = config.get('deploymentEnvironment');

  if (deploymentEnv === 'local') {
    next();
    return;
  }

  if (stage !== 'PASSWORD') {
    next();
    return;
  }

  if (!token) {
    logger.warn('Captcha token is missing from request body');
    res
      .status(HTTP_STATUSES.badRequest)
      .json({ error: 'Captcha verification is required' });
    return;
  }

  logger.debug(`Verifying captcha token: ${token.substring(0, 20)}...`);

  try {
    const secretKey = config.get('captcha.turnstileSecretKey');
    if (!secretKey || secretKey.startsWith('1x00000000')) {
      logger.warn(
        'Turnstile secret key is not properly configured. Using test key.',
      );
    }

    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    if (!verifyResponse.ok) {
      logger.error(
        `Cloudflare API returned HTTP ${verifyResponse.status}: ${verifyResponse.statusText}`,
      );
      res
        .status(HTTP_STATUSES.serverError)
        .json({ error: 'Captcha verification service unavailable' });
      return;
    }

    const result = (await verifyResponse.json()) as {
      success: boolean;
      error_codes?: string[];
      challenge_ts?: string;
      hostname?: string;
    };

    if (!result.success) {
      logger.error(
        `Captcha verification failed. Error codes: ${result.error_codes?.join(', ') || 'none'}. Response: ${JSON.stringify(result)}`,
      );
      res
        .status(HTTP_STATUSES.badRequest)
        .json({ error: 'Captcha verification failed' });
      return;
    }

    logger.debug('Captcha verification succeeded');
    next();
  } catch (err) {
    logger.error(
      `Captcha verification error: ${(err as Error).message}. Stack: ${(err as Error).stack}`,
    );
    res
      .status(HTTP_STATUSES.serverError)
      .json({ error: 'Captcha verification failed' });
  }
};

export default verifyCaptcha;
