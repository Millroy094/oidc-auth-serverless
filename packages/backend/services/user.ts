import { AnyItem } from 'dynamoose/dist/Item';
import isEmpty from 'lodash/isEmpty.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.ts';
import User from '../models/User.ts';
import OIDCService from './oidc.ts';
import generateOtp from '../utils/generate-otp.ts';
import OTPService from './otp.ts';
import { sendEmail } from '../utils/notification.ts';

class UserService {
  public static async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<AnyItem> {
    const [userAccount] = await User.scan('email').eq(username).exec();

    if (isEmpty(userAccount)) {
      throw new Error('User does not exist');
    }

    if (userAccount.suspended) {
      throw new Error('User is suspended');
    }

    const passwordCompare = await bcrypt.compare(
      password,
      userAccount.password,
    );

    if (!passwordCompare) {
      userAccount.failedLogins += 1;

      if (userAccount.failedLogins >= 3) {
        userAccount.suspended = true;
      }

      await userAccount.save();

      throw new Error('Invalid password');
    }

    userAccount.failedLogins = 0;
    userAccount.lastLoggedIn = Date.now();

    await userAccount.save();

    return userAccount;
  }

  public static async createUser(fields: {
    email: string;
    firstName: string;
    lastName: string;
    mobile?: string;
    password: string;
  }): Promise<void> {
    const { email } = fields;
    const [userAccount] = await User.scan('email').eq(email).exec();

    if (!isEmpty(userAccount)) {
      throw new Error('User already exists');
    }

    await User.create(fields);
  }

  public static async getUsers(): Promise<AnyItem[]> {
    const userAccounts = await User.scan().exec();
    return userAccounts;
  }

  public static async getUserById(id: string): Promise<AnyItem> {
    const userAccount = await User.get(id, {
      attributes: [
        'userId',
        'firstName',
        'lastName',
        'email',
        'emailVerified',
        'mobile',
        'roles',
        'suspended',
        'lastLoggedIn',
      ],
    });

    if (isEmpty(userAccount)) {
      throw new Error('User does not exists');
    }

    return userAccount;
  }

  public static async getUserByEmail(email: string) {
    const [user] = await User.scan('email').eq(email).exec();

    if (isEmpty(user)) {
      throw new Error('User does not exists');
    }
    return user;
  }

  public static async updateUser(
    userId: string,
    updatedFields: any,
  ): Promise<boolean> {
    await User.update(userId, updatedFields);

    return true;
  }

  public static async deleteUser(userId: string): Promise<boolean> {
    await OIDCService.deleteAllSessions(userId);
    const user = await this.getUserById(userId);
    await user.delete();
    return true;
  }

  public static async getLoginConfiguration(email: string): Promise<{
    emailVerified: boolean;
    mfa: { enabled: boolean; type: string };
  }> {
    let user = null;

    try {
      user = await UserService.getUserByEmail(email);
    } catch (err) {
      logger.error('User not found');
    }

    if (!user) {
      return { emailVerified: true, mfa: { enabled: false, type: '' } };
    }

    return {
      emailVerified: user.emailVerified,
      mfa: { enabled: !!user.mfa.preference, type: user.mfa.preference },
    };
  }

  public static async sendEmailVerificationOtp(email: string): Promise<void> {
    const user = await UserService.getUserByEmail(email);

    const otp = generateOtp();
    await OTPService.storeOtp(user.userId, 'email', otp);
    await sendEmail(
      email,
      'Email verification',
      `Please use ${otp} to verify your email`,
    );
  }

  public static async verifyEmail(userId: string, otp: string): Promise<void> {
    const user = await User.get(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    if (!(await OTPService.validateOtp(userId, 'email', otp))) {
      throw new Error('Invalid OTP');
    }

    user.emailVerified = true;

    await user.save();
  }

  public static async sendPasswordResetOtp(email: string): Promise<void> {
    const user = await UserService.getUserByEmail(email);

    const otp = generateOtp();
    await OTPService.storeOtp(user.userId, 'email', otp);
    await sendEmail(
      email,
      'Password reset OTP',
      `Please use ${otp} to reset your password`,
    );
  }

  public static async changePassword(
    email: string,
    otp: string,
    password: string,
  ): Promise<void> {
    const user = await UserService.getUserByEmail(email);

    if (!(await OTPService.validateOtp(user.userId, 'email', otp))) {
      throw new Error('Invalid OTP');
    }

    user.password = password;

    await user.save();
  }
}

export default UserService;
