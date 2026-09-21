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
});

const Settings = model<SettingsItem>('Settings', SettingsSchema, tableOptions);

export default Settings;
