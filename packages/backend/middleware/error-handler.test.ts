import { NextFunction, Request, Response } from 'express';
import errorHandler from '../middleware/error-handler';
import logger from '../utils/logger';
import HTTP_STATUSES from '../constants/http-status';

jest.mock('../utils/logger');
jest.mock('../constants/http-status', () => ({
  serverError: 500,
}));

describe('errorHandler middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs the error message and sends a server error response', () => {
    const error = new Error('Test error');

    errorHandler(error, req as Request, res as Response, next as NextFunction);

    expect(logger.error).toHaveBeenCalledWith('Test error');

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUSES.serverError);
    expect(res.send).toHaveBeenCalledWith({
      message: 'There was an issue serving this request',
    });
  });

  it('handles cases with no error message', () => {
    const error = new Error();

    errorHandler(error, req as Request, res as Response, next as NextFunction);

    expect(logger.error).toHaveBeenCalledWith('');

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUSES.serverError);
    expect(res.send).toHaveBeenCalledWith({
      message: 'There was an issue serving this request',
    });
  });
});
