import OIDCService from './oidc';
import OIDCStore from '../models/OIDCStore';

jest.mock('../models/OIDCStore', () => {
  const mockScan = jest.fn().mockReturnThis();
  return {
    scan: mockScan,
    eq: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({
      toJSON: jest.fn(() => [
        {
          payload: {
            jti: 'sessionId123',
            loginTs: 1633036800000,
            authorizations: {
              client1: {},
              client2: {},
            },
            iat: 1633036800,
            exp: 1633040400,
          },
        },
      ]),
    }),
    delete: jest.fn().mockResolvedValue(true), // Mock delete method here
  };
});

describe('OIDCService', () => {
  describe('getSessions', () => {
    it('should return formatted session data for a given userId', async () => {
      const userId = 'user123';
      const result = await OIDCService.getSessions(userId);

      expect(OIDCStore.scan).toHaveBeenCalledWith('payload.accountId');
      expect(OIDCStore.eq).toHaveBeenCalledWith(userId);
      expect(result).toEqual([
        {
          id: 'sessionId123',
          loggedInAt: 1633036800000,
          clients: ['client1', 'client2'],
          iat: 1633036800,
          exp: 1633040400,
        },
      ]);
    });
  });

  describe('deleteAllSessions', () => {
    it('should delete all sessions for the user', async () => {
      const userId = 'testUserId';
      const mockSessions = [
        { id: 'session1', payload: { accountId: userId } },
        { id: 'session2', payload: { accountId: userId } },
      ];

      // Mock the scan response
      (OIDCStore.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSessions),
      });

      // Mock the deleteAllResults function
      const deleteAllResultsMock = jest
        .spyOn(OIDCService, 'deleteAllResults')
        .mockResolvedValue();

      await OIDCService.deleteAllSessions(userId);

      expect(deleteAllResultsMock).toHaveBeenCalledWith(mockSessions);
      expect(deleteAllResultsMock).toHaveBeenCalledTimes(1);
    });

    it('should not throw an error if no sessions are found', async () => {
      const userId = 'nonExistingUser';

      (OIDCStore.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await expect(
        OIDCService.deleteAllSessions(userId),
      ).resolves.not.toThrow();
    });
  });

  describe('deleteSession', () => {
    it('should not throw an error if the session does not exist', async () => {
      const sessionId = 'nonExistingSession';

      (OIDCStore.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]), // No session found
      });

      await expect(OIDCService.deleteSession(sessionId)).resolves.toBe(true);
    });
    it('should not throw an error if the session does not exist', async () => {
      const sessionId = 'nonExistingSession';

      (OIDCStore.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]), // No session found
      });

      await expect(OIDCService.deleteSession(sessionId)).resolves.toBe(true);
    });
  });
});
