import { NextFunction, Request, Response } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';
import logger from '../utils/logger.ts';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.message);

  if (res.headersSent) {
    return next(err);
  }

  res
    .status(HTTP_STATUSES.serverError)
    .send({ message: 'There was an issue serving this request' });
};
export default errorHandler;
