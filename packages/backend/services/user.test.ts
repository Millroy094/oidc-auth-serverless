import bcrypt from 'bcryptjs';
import UserService from './user.ts';
import OTPService from './otp.ts';
import User from '../models/User.ts';
import { sendEmail } from '../utils/notification';
import generateOtp from '../utils/generate-otp';

jest.mock('bcryptjs');
jest.mock('../models/User.ts');
jest.mock('./otp');
jest.mock('../utils/notification');
jest.mock('../utils/generate-otp');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserCredentials', () => {
    it('should error when user not found', async () => {
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      });
      await expect(
        UserService.validateUserCredentials(
          'nonexistent@example.com',
          'password',
        ),
      ).rejects.toThrow('User does not exist');
    });
    it('should error when user is suspended', async () => {
      const suspendedUser = { suspended: true };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([suspendedUser]),
        }),
      });

      await expect(
        UserService.validateUserCredentials('user@example.com', 'password'),
      ).rejects.toThrow('User is suspended');
    });
    it("should error when password doesn't match", async () => {
      const user = {
        password: 'hashed_password',
        failedLogins: 0,
        save: jest.fn(),
      };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([user]) }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        UserService.validateUserCredentials(
          'user@example.com',
          'wrong_password',
        ),
      ).rejects.toThrow('Invalid password');
      expect(user.save).toHaveBeenCalled();
    });
    it('should reset failed logins and update lastLoggedIn if password is correct', async () => {
      const user = {
        password: 'hashed_password',
        failedLogins: 3,
        save: jest.fn(),
        lastLoggedIn: 0,
      };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([user]) }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await UserService.validateUserCredentials(
        'user@example.com',
        'correct_password',
      );

      expect(result).toBe(user);
      expect(user.failedLogins).toBe(0);
      expect(user.lastLoggedIn).not.toBe(0);
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should throw an error if the user already exists', async () => {
      const existingUser = { email: 'existing@example.com' };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([existingUser]),
        }),
      });

      await expect(
        UserService.createUser({
          email: 'existing@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password',
        }),
      ).rejects.toThrow('User already exists');
    });

    it('should create a new user if email is unique', async () => {
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      });
      (User.create as jest.Mock).mockResolvedValue(true);

      await expect(
        UserService.createUser({
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          password: 'password',
        }),
      ).resolves.toBeUndefined();
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newuser@example.com' }),
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      (User.get as jest.Mock).mockResolvedValue(mockUser);

      const user = await UserService.getUserById('user123');
      expect(user).toEqual(mockUser);
    });

    it('should throw an error if user does not exist', async () => {
      (User.get as jest.Mock).mockResolvedValue(null);

      await expect(UserService.getUserById('invalidId')).rejects.toThrow(
        'User does not exists',
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should throw an error if the user does not exist', async () => {
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      });

      await expect(
        UserService.getUserByEmail('nonexistent@example.com'),
      ).rejects.toThrow('User does not exists');
    });

    it('should return the user if they exist', async () => {
      const user = { email: 'existing@example.com' };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([user]) }),
      });

      const result = await UserService.getUserByEmail('existing@example.com');

      expect(result).toBe(user);
    });
  });

  describe('changePassword', () => {
    it('should throw an error if the OTP is invalid', async () => {
      const user = { userId: '123' };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([user]) }),
      });
      (OTPService.validateOtp as jest.Mock).mockResolvedValue(false);

      await expect(
        UserService.changePassword(
          'user@example.com',
          'invalid_otp',
          'new_password',
        ),
      ).rejects.toThrow('Invalid OTP');
    });

    it('should update the user password if the OTP is valid', async () => {
      const user = {
        userId: '123',
        save: jest.fn(),
        password: 'hashed_old_password',
      };
      (User.scan as jest.Mock).mockReturnValue({
        eq: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([user]) }),
      });
      (OTPService.validateOtp as jest.Mock).mockResolvedValue(true);

      await UserService.changePassword(
        'user@example.com',
        'valid_otp',
        'new_password',
      );

      expect(user.password).toBe('new_password');
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetOtp', () => {
    it('should send a password reset OTP', async () => {
      const email = 'test@example.com';
      const mockUser = {
        userId: 'user123',
        email,
      };

      UserService.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
      const otp = '123456';
      (generateOtp as jest.Mock).mockReturnValue(otp);

      await UserService.sendPasswordResetOtp(email);
      expect(OTPService.storeOtp).toHaveBeenCalledWith(
        mockUser.userId,
        'email',
        otp,
      );
      expect(sendEmail).toHaveBeenCalledWith(
        email,
        'Password reset OTP',
        `Please use ${otp} to reset your password`,
      );
    });

    it('should throw an error if user does not exist', async () => {
      const email = 'notfound@example.com';
      UserService.getUserByEmail = jest
        .fn()
        .mockRejectedValue(new Error('User does not exist'));

      await expect(UserService.sendPasswordResetOtp(email)).rejects.toThrow(
        'User does not exist',
      );
    });
  });
});
