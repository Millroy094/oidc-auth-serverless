import { Request, Response, NextFunction } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';
import config from '../support/env-config.ts';

// CloudFront attaches this secret as a custom header on every request it
// forwards to the API Gateway origin; direct requests won't have it and get
// rejected. Not enforced locally, where there is no CloudFront in front.
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
