import { Response } from 'express';

export interface ChallengeResponseUser {
  userId: string;
  email: string;
  emailVerified: boolean;
  roles?: string[];
  mfa: {
    preference?: string | null;
  };
}

export const requiresEmailVerification = (
  user: ChallengeResponseUser,
  otp?: string,
): boolean => {
  return !user.emailVerified && !otp;
};

export const requiresMfa = (
  user: ChallengeResponseUser,
  otp?: string,
  loginWithRecoveryCode?: boolean,
): boolean => {
  return Boolean(user.mfa.preference) && !otp && !loginWithRecoveryCode;
};

export const respondEmailVerificationRequired = (
  res: Response,
  user: ChallengeResponseUser,
): void => {
  res.status(200).json({
    challengeName: 'EMAIL_VERIFICATION_REQUIRED',
    challengeParameters: {
      userId: user.userId,
      email: user.email,
    },
  });
};

export const respondMfaRequired = (
  res: Response,
  user: ChallengeResponseUser,
): void => {
  res.status(200).json({
    challengeName: 'MFA_REQUIRED',
    challengeParameters: {
      mfaType: user.mfa.preference,
      userId: user.userId,
      email: user.email,
    },
  });
};
