import Settings, { SettingsItem, TTL_SETTINGS_ID } from '../models/Settings.ts';

export interface TtlSettings {
  accessTokenTtl: number;
  idTokenTtl: number;
  refreshTokenTtl: number;
  sessionTtl: number;
  grantTtl: number;
}

export const DEFAULT_TTL_SETTINGS: TtlSettings = {
  accessTokenTtl: 60 * 60,
  idTokenTtl: 60 * 60,
  refreshTokenTtl: 2 * 60 * 60,
  sessionTtl: 2 * 60 * 60,
  grantTtl: 2 * 60 * 60,
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
    const settings = await Settings.get(TTL_SETTINGS_ID);

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

    await Settings.update(TTL_SETTINGS_ID, fields);

    return SettingsService.getTtlSettings();
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
