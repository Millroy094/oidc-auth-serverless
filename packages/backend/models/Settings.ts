import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import tableOptions from '../support/dynamoose-table-options.ts';

const { Schema, model } = dynamoose;

// Single-row table: there is only ever one item, keyed by this constant, used
// to store admin-configurable OIDC token/session lifetimes.
export const TTL_SETTINGS_ID = 'oidc-ttl';

export interface SettingsItem extends Item {
  id: string;
  accessTokenTtl?: number;
  idTokenTtl?: number;
  refreshTokenTtl?: number;
  sessionTtl?: number;
  grantTtl?: number;
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
});

const Settings = model<SettingsItem>('Settings', SettingsSchema, tableOptions);

export default Settings;
