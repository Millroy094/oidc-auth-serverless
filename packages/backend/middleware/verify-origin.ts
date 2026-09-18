import { Request, Response, NextFunction } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';
import config from '../support/env-config.ts';

// CloudFront attaches this secret as a custom header to every request it
// forwards to the API Gateway origin. Requests that reach the API directly
// (bypassing CloudFront) won't have it, so they get rejected here. Not
// enforced locally, where there is no CloudFront in front of the backend.
const verifyOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (config.get('deploymentEnvironment') === 'local') {
    next();
    return;
  }

  const expected = config.get('security.originVerifySecret');
  const received = req.headers['x-origin-verify'];

  if (!expected || received !== expected) {
    res.status(HTTP_STATUSES.forbidden).json({ error: 'Forbidden' });
    return;
  }

  next();
};

export default verifyOrigin;
