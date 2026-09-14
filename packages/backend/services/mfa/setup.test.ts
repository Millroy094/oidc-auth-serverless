import { setupAppMFA } from './setup.ts';
import User from '../../models/User.ts';

jest.mock('../../models/User.ts');
jest.mock('./send.ts');

describe('setupAppMFA', () => {
  const userId = 'user-123';
  const subscriber = 'user@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully set up app MFA', async () => {
    const user = {
      userId,
      mfa: { app: { secret: '', subscriber: '' }, sms: {}, email: {} },
      save: jest.fn(),
    };

    (User.get as jest.Mock).mockResolvedValue(user);

    const result = await setupAppMFA(userId, subscriber);

    expect(user.mfa.app.secret).toBeDefined();
    expect(user.mfa.app.subscriber).toBe(subscriber);
    expect(user.save).toHaveBeenCalled();
    expect(result.uri).toBeDefined();
  });

  it('should throw an error if user does not exist', async () => {
    (User.get as jest.Mock).mockResolvedValue(null);

    await expect(setupAppMFA(userId, subscriber)).rejects.toThrow(
      'User does not exist',
    );
  });
});
