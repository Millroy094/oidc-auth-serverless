import PasskeyService from '../services/passkey';
import Challenge from '../models/Challenge';

jest.mock('../models/Challenge', () => ({
  create: jest.fn(),
  scan: jest.fn(() => ({
    eq: jest.fn(() => ({
      and: jest.fn(() => ({
        where: jest.fn(() => ({
          eq: jest.fn(() => ({
            exec: jest.fn(), // This will be mocked as well
          })),
        })),
      })),
    })),
  })),
}));

describe('PasskeyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('decodeClientData', () => {
    it('should decode base64url encoded client data to JSON', () => {
      const encodedClientData = 'eyJ0ZXN0IjoiZGF0YSJ9'; // Base64url for '{"test":"data"}'
      const result = PasskeyService.decodeClientData(encodedClientData);
      expect(result).toEqual({ test: 'data' });
    });
  });

  describe('createChallenge', () => {
    it('should create a challenge for the user', async () => {
      const userId = 'testUserId';
      const challenge = 'testChallenge';

      await PasskeyService.createChallenge(userId, challenge);

      expect(Challenge.create).toHaveBeenCalledWith({
        userId,
        challenge,
        expiresAt: expect.any(Number), // Verify expiresAt is a number
      });
    });
  });

  describe('retrieveChallenge', () => {
    it('should retrieve a challenge for the user', async () => {
      const userId = 'testUserId';
      const challenge = 'testChallenge';
      const mockChallengeResult = { challenge: 'testChallenge' };

      // Mock the full chain of methods
      (Challenge.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockChallengeResult]),
      });

      const result = await PasskeyService.retrieveChallenge(userId, challenge);

      expect(result).toBe('testChallenge');
      expect(Challenge.scan).toHaveBeenCalled();
    });

    it('should return undefined if no challenge is found', async () => {
      const userId = 'testUserId';
      const challenge = 'nonExistingChallenge';

      // Setup the exec mock to return an empty array
      (Challenge.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await PasskeyService.retrieveChallenge(userId, challenge);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteChallenge', () => {
    it('should delete the challenge for the user if it exists', async () => {
      const userId = 'testUserId';
      const challenge = 'testChallenge';
      const mockChallengeResult = { delete: jest.fn() };

      // Setup the exec mock to return the mock challenge
      (Challenge.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockChallengeResult]),
      });

      await PasskeyService.deleteChallenge(userId, challenge);

      expect(mockChallengeResult.delete).toHaveBeenCalled();
    });

    it('should not throw an error if no challenge is found', async () => {
      const userId = 'testUserId';
      const challenge = 'nonExistingChallenge';

      // Setup the exec mock to return an empty array
      (Challenge.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await expect(
        PasskeyService.deleteChallenge(userId, challenge),
      ).resolves.not.toThrow();
    });
  });
});
