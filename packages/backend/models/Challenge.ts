import dynamoose from 'dynamoose';
import { v4 as uuid } from 'uuid';
import isEmpty from 'lodash/isEmpty.js';
import { ValueType } from 'dynamoose/dist/Schema';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

const ChallengeSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => uuid(),
    },
    challenge: {
      type: String,
      set: (value: ValueType) =>
        !isEmpty(value) ? encryptData(value as string) : value,
      get: (value: ValueType) =>
        !isEmpty(value) ? decryptData(value as string) : value,
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
const Challenge = model('Challenge', ChallengeSchema, {
  expires: {
    ttl: 300,
    attribute: 'expiresAt',
    items: {
      returnExpired: false,
    },
  },
});

export default Challenge;
