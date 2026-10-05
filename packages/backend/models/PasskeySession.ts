import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { v4 as uuid } from 'uuid';
import tableOptions from '../support/dynamoose-table-options.ts';

const { Schema, model } = dynamoose;

export interface PasskeySessionItem extends Item {
  sessionId: string;
  userId: string;
  deviceName: string;
  challenge: string;
  expiresAt?: number;
}

const PasskeySessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      hashKey: true,
      default: () => uuid(),
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: 'userId-index',
        type: 'global',
      },
    },
    deviceName: {
      type: String,
    },
    challenge: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PasskeySession = model<PasskeySessionItem>(
  'PasskeySession',
  PasskeySessionSchema,
  {
    ...tableOptions,
    expires: {
      // dynamoose's expires.ttl expects milliseconds, not seconds - without
      // the *1000 the session (and the QR-code cross-device flow relying on
      // it) expires almost immediately after creation.
      ttl: 600 * 1000,
      attribute: 'expiresAt',
      items: {
        returnExpired: false,
      },
    },
  },
);

export default PasskeySession;
