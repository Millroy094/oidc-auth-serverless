import { Request, Response, NextFunction } from 'express';
import authorize from '../middleware/authorize';
import logger from '../utils/logger';
import UserService from '../services/user';
import { AnyItem } from 'dynamoose/dist/Item';

jest.mock('../utils/logger');
jest.mock('../services/user');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('authorize middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { user: { userId: '123', email: '123@example.com' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls next if no permissions are provided', async () => {
    const middleware = authorize(undefined);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if user is not authenticated', async () => {
    req.user = undefined;
    const middleware = authorize(['admin']);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authorisation failed! user not authenticated',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next if user has required permissions', async () => {
    mockUserService.getUserById.mockResolvedValue({
      roles: ['admin'],
    } as unknown as AnyItem);
    const middleware = authorize(['admin']);

    await middleware(req as Request, res as Response, next);

    expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 if user lacks required permissions', async () => {
    mockUserService.getUserById.mockResolvedValue({
      roles: [],
    } as unknown as AnyItem);
    const middleware = authorize(['admin']);

    await middleware(req as Request, res as Response, next);

    expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Authorisation failed! user doesn't have sufficient permissions to carry out this task",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('logs an error and returns 403 if an exception occurs', async () => {
    mockUserService.getUserById.mockRejectedValue(new Error('Database error'));
    const middleware = authorize(['admin']);

    await middleware(req as Request, res as Response, next);

    expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
    expect(mockLogger.error).toHaveBeenCalledWith('Database error');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Authorisation failed! user doesn't have sufficient permissions to carry out this task",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
