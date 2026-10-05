import Settings, { SettingsItem, SETTINGS_ID } from '../models/Settings.ts';

export interface TtlSettings {
  accessTokenTtl: number;
  idTokenTtl: number;
  refreshTokenTtl: number;
  sessionTtl: number;
  grantTtl: number;
}

export interface PasskeySettings {
  attestationType: 'none' | 'direct';
  authenticatorAttachment: 'platform' | 'cross-platform' | 'all';
  challengeTimeout: number;
  maxPerUser: number;
  crossDeviceSessionTimeout: number;
}

export const DEFAULT_TTL_SETTINGS: TtlSettings = {
  accessTokenTtl: 60 * 60,
  idTokenTtl: 60 * 60,
  refreshTokenTtl: 2 * 60 * 60,
  sessionTtl: 2 * 60 * 60,
  grantTtl: 2 * 60 * 60,
};

export const DEFAULT_REGISTRATION_ENABLED = true;

export const DEFAULT_ROTATE_REFRESH_TOKEN_ON_USE = true;

export const DEFAULT_PASSKEY_SETTINGS: PasskeySettings = {
  attestationType: 'none',
  authenticatorAttachment: 'platform',
  challengeTimeout: 300,
  maxPerUser: 0,
  crossDeviceSessionTimeout: 600,
};

// Guardrails so an admin can't accidentally set a lifetime that's too short
// to be usable or long enough to undermine the point of having a limit.
const MIN_TTL = 5 * 60;
const MAX_TTL = 30 * 24 * 60 * 60;

const TTL_FIELDS = [
  'accessTokenTtl',
  'idTokenTtl',
  'refreshTokenTtl',
  'sessionTtl',
  'grantTtl',
] as const;

class SettingsService {
  public static async getTtlSettings(): Promise<TtlSettings> {
    const settings = await Settings.get(SETTINGS_ID);

    return {
      ...DEFAULT_TTL_SETTINGS,
      ...(settings ? SettingsService.toTtlSettings(settings) : {}),
    };
  }

  public static async updateTtlSettings(
    fields: Partial<TtlSettings>,
  ): Promise<TtlSettings> {
    for (const field of TTL_FIELDS) {
      const value = fields[field];

      if (
        value !== undefined &&
        (!Number.isInteger(value) || value < MIN_TTL || value > MAX_TTL)
      ) {
        throw new Error(
          `${field} must be an integer between ${MIN_TTL} and ${MAX_TTL} seconds`,
        );
      }
    }

    await Settings.update(SETTINGS_ID, fields);

    return SettingsService.getTtlSettings();
  }

  public static async getRegistrationEnabled(): Promise<boolean> {
    const settings = await Settings.get(SETTINGS_ID);

    return settings?.registrationEnabled ?? DEFAULT_REGISTRATION_ENABLED;
  }

  public static async updateRegistrationEnabled(
    registrationEnabled: boolean,
  ): Promise<boolean> {
    await Settings.update(SETTINGS_ID, { registrationEnabled });

    return SettingsService.getRegistrationEnabled();
  }

  public static async getRotateRefreshTokenOnUse(): Promise<boolean> {
    const settings = await Settings.get(SETTINGS_ID);

    return (
      settings?.rotateRefreshTokenOnUse ?? DEFAULT_ROTATE_REFRESH_TOKEN_ON_USE
    );
  }

  public static async updateRotateRefreshTokenOnUse(
    rotateRefreshTokenOnUse: boolean,
  ): Promise<boolean> {
    await Settings.update(SETTINGS_ID, { rotateRefreshTokenOnUse });

    return SettingsService.getRotateRefreshTokenOnUse();
  }

  public static async getPasskeySettings(): Promise<PasskeySettings> {
    const settings = await Settings.get(SETTINGS_ID);

    return {
      attestationType:
        settings?.passkeyAttestationType ??
        DEFAULT_PASSKEY_SETTINGS.attestationType,
      authenticatorAttachment:
        settings?.passkeyAuthenticatorAttachment ??
        DEFAULT_PASSKEY_SETTINGS.authenticatorAttachment,
      challengeTimeout:
        settings?.passkeyChallengeTimeout ??
        DEFAULT_PASSKEY_SETTINGS.challengeTimeout,
      maxPerUser:
        settings?.passkeyMaxPerUser ?? DEFAULT_PASSKEY_SETTINGS.maxPerUser,
      crossDeviceSessionTimeout:
        settings?.passkeyCrossDeviceSessionTimeout ??
        DEFAULT_PASSKEY_SETTINGS.crossDeviceSessionTimeout,
    };
  }

  public static async updatePasskeySettings(
    fields: Partial<PasskeySettings>,
  ): Promise<PasskeySettings> {
    const updateData: Record<string, PasskeySettings[keyof PasskeySettings]> =
      {};

    if (fields.attestationType) {
      updateData.passkeyAttestationType = fields.attestationType;
    }
    if (fields.authenticatorAttachment) {
      updateData.passkeyAuthenticatorAttachment =
        fields.authenticatorAttachment;
    }
    if (fields.challengeTimeout !== undefined) {
      if (
        !Number.isInteger(fields.challengeTimeout) ||
        fields.challengeTimeout < 30 ||
        fields.challengeTimeout > 3600
      ) {
        throw new Error(
          'Challenge timeout must be an integer between 30 and 3600 seconds',
        );
      }
      updateData.passkeyChallengeTimeout = fields.challengeTimeout;
    }
    if (fields.maxPerUser !== undefined) {
      if (!Number.isInteger(fields.maxPerUser) || fields.maxPerUser < 0) {
        throw new Error(
          'Max per user must be a non-negative integer (0 = unlimited)',
        );
      }
      updateData.passkeyMaxPerUser = fields.maxPerUser;
    }
    if (fields.crossDeviceSessionTimeout !== undefined) {
      if (
        !Number.isInteger(fields.crossDeviceSessionTimeout) ||
        fields.crossDeviceSessionTimeout < 60 ||
        fields.crossDeviceSessionTimeout > 3600
      ) {
        throw new Error(
          'Cross-device session timeout must be an integer between 60 and 3600 seconds',
        );
      }
      updateData.passkeyCrossDeviceSessionTimeout =
        fields.crossDeviceSessionTimeout;
    }

    if (Object.keys(updateData).length > 0) {
      await Settings.update(SETTINGS_ID, updateData);
    }

    return SettingsService.getPasskeySettings();
  }

  private static toTtlSettings(settings: SettingsItem): Partial<TtlSettings> {
    return TTL_FIELDS.reduce<Partial<TtlSettings>>((acc, field) => {
      const value = settings[field];

      if (typeof value === 'number') {
        acc[field] = value;
      }

      return acc;
    }, {});
  }
}

export default SettingsService;
