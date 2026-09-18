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
  const token = (req.body as { captchaToken?: string })?.captchaToken;

  if (!token) {
    res
      .status(HTTP_STATUSES.badRequest)
      .json({ error: 'Captcha verification is required' });
    return;
  }

  try {
    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: config.get('captcha.turnstileSecretKey'),
        response: token,
      }),
    });

    const result = (await verifyResponse.json()) as { success: boolean };

    if (!result.success) {
      res
        .status(HTTP_STATUSES.badRequest)
        .json({ error: 'Captcha verification failed' });
      return;
    }

    next();
  } catch (err) {
    logger.error((err as Error).message);
    res
      .status(HTTP_STATUSES.serverError)
      .json({ error: 'Captcha verification failed' });
  }
};

export default verifyCaptcha;
