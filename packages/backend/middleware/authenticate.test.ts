import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authenticate from '../middleware/authenticate';
import logger from '../utils/logger';
import UserService from '../services/user';
import config from '../support/env-config';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/authentication';
import { AnyItem } from 'dynamoose/dist/Item';

jest.mock('../utils/logger');
jest.mock('../services/user');
jest.mock('jsonwebtoken');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('authenticate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {
        [ACCESS_TOKEN]: 'validAccessToken',
        [REFRESH_TOKEN]: 'validRefreshToken',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls next when tokens are valid and user is not suspended', async () => {
    mockJwt.verify.mockImplementation((token) => {
      if (token === 'validAccessToken')
        return { userId: '123', email: 'user@example.com' };
      if (token === 'validRefreshToken')
        return { userId: '123', email: 'user@example.com' };
      throw new Error('Invalid token');
    });
    mockUserService.getUserById.mockResolvedValue({
      userId: '123',
      suspended: false,
    } as unknown as AnyItem);

    await authenticate(req as Request, res as Response, next);

    expect(mockJwt.verify).toHaveBeenCalledWith(
      'validAccessToken',
      config.get('authentication.accessTokenSecret'),
    );
    expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
    expect(next).toHaveBeenCalled();
  });

  it('throws error when tokens are missing from cookies', async () => {
    req.cookies = {};
    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Authentication failed, authentication tokens missing from header cookies',
    );
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed, please check if you are still logged in',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('generates new tokens if access token is expired and refresh token is valid', async () => {
    req.cookies = {
      [ACCESS_TOKEN]: 'expiredAccessToken',
      [REFRESH_TOKEN]: 'validRefreshToken',
    };
    mockJwt.verify.mockImplementation((token) => {
      if (token === 'expiredAccessToken') throw { name: 'TokenExpiredError' };
      if (token === 'validRefreshToken')
        return { userId: '123', email: 'user@example.com' };
    });
    mockJwt.sign.mockImplementation(() => 'newToken');
    mockUserService.getUserById.mockResolvedValue({
      userId: '123',
      suspended: false,
    } as unknown as AnyItem);

    await authenticate(req as Request, res as Response, next);

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN,
      'newToken',
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN,
      'newToken',
      expect.any(Object),
    );
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if user account is suspended', async () => {
    mockJwt.verify.mockImplementation(() => ({
      userId: '123',
      email: 'user@example.com',
    }));
    mockUserService.getUserById.mockResolvedValue({
      userId: '123',
      suspended: true,
    } as unknown as AnyItem);

    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Authentication failed! User is suspended',
    );
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed, please check if you are still logged in',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('logs error and returns 401 if there is an unexpected error', async () => {
    mockJwt.verify.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await authenticate(req as Request, res as Response, next);

    expect(mockLogger.error).toHaveBeenCalledWith('Unexpected error');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed, please check if you are still logged in',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
