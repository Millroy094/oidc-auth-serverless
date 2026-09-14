import dynamoose from 'dynamoose';
import { v4 as uuid } from 'uuid';
import isEmpty from 'lodash/isEmpty.js';
import { ValueType } from 'dynamoose/dist/Schema';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

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
    },
  },
  {
    timestamps: true,
  },
);
const OTP = model('OTP', OTPSchema, {
  expires: {
    ttl: 300,
    attribute: 'expiresAt',
    items: {
      returnExpired: false,
    },
  },
});

export default OTP;
