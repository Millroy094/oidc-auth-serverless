import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ValueType } from 'dynamoose/dist/Schema';
import isEmpty from 'lodash/isEmpty.js';
import { v4 as uuid } from 'uuid';
import tableOptions from '../support/dynamoose-table-options.ts';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

export interface OTPItem extends Item {
  id: string;
  otp: string;
  type: string;
  userId: string;
  expiresAt?: number;
}

const OTPSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => uuid(),
    },
    otp: {
      type: String,
      set: (value: ValueType) =>
        !isEmpty(value) ? encryptData(value as string) : '',
      get: (value: ValueType) =>
        !isEmpty(value) ? decryptData(value as string) : '',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: 'userId-index',
        type: 'global',
      },
    },
  },
  {
    timestamps: true,
  },
);
const OTP = model<OTPItem>('OTP', OTPSchema, {
  ...tableOptions,
  expires: {
    ttl: 300,
    attribute: 'expiresAt',
    items: {
      returnExpired: false,
    },
  },
});

export default OTP;
