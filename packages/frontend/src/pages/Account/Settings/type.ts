export interface ISettingsInput {
  accessTokenTtl: number;
  idTokenTtl: number;
  refreshTokenTtl: number;
  sessionTtl: number;
  grantTtl: number;
  registrationEnabled: boolean;
  rotateRefreshTokenOnUse: boolean;
  passkeyAttestationType: 'none' | 'direct';
  passkeyAuthenticatorAttachment: 'platform' | 'cross-platform' | 'all';
  passkeyChallengeTimeout: number;
  passkeyMaxPerUser: number;
  passkeyCrossDeviceSessionTimeout: number;
}
