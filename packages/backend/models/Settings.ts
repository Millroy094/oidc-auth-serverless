import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import tableOptions from '../support/dynamoose-table-options.ts';

const { Schema, model } = dynamoose;

// Single-row table: there is only ever one item, keyed by this constant, used
// to store admin-configurable app settings (OIDC token/session lifetimes,
// whether new user registration is open).
export const SETTINGS_ID = 'oidc-ttl';

export interface SettingsItem extends Item {
  id: string;
  accessTokenTtl?: number;
  idTokenTtl?: number;
  refreshTokenTtl?: number;
  sessionTtl?: number;
  grantTtl?: number;
  registrationEnabled?: boolean;
  rotateRefreshTokenOnUse?: boolean;
  passkeyAttestationType?: 'none' | 'direct';
  passkeyAuthenticatorAttachment?: 'platform' | 'cross-platform' | 'all';
  passkeyChallengeTimeout?: number;
  passkeyMaxPerUser?: number;
  passkeyCrossDeviceSessionTimeout?: number;
}

const SettingsSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  accessTokenTtl: {
    type: Number,
  },
  idTokenTtl: {
    type: Number,
  },
  refreshTokenTtl: {
    type: Number,
  },
  sessionTtl: {
    type: Number,
  },
  grantTtl: {
    type: Number,
  },
  registrationEnabled: {
    type: Boolean,
  },
  rotateRefreshTokenOnUse: {
    type: Boolean,
  },
  passkeyAttestationType: {
    type: String,
    enum: ['none', 'direct'],
    default: 'none',
  },
  passkeyAuthenticatorAttachment: {
    type: String,
    enum: ['platform', 'cross-platform', 'all'],
    default: 'platform',
  },
  passkeyChallengeTimeout: {
    type: Number,
    default: 300,
  },
  passkeyMaxPerUser: {
    type: Number,
    default: 0,
  },
  passkeyCrossDeviceSessionTimeout: {
    type: Number,
    default: 600,
  },
});

const Settings = model<SettingsItem>('Settings', SettingsSchema, tableOptions);

export default Settings;
