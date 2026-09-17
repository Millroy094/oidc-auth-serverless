import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ValueType } from 'dynamoose/dist/Schema';
import isEmpty from 'lodash/isEmpty.js';
import { v4 as uuid } from 'uuid';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

export interface ChallengeItem extends Item {
  id: string;
  challenge: string;
  userId: string;
  expiresAt?: number;
}

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
const Challenge = model<ChallengeItem>('Challenge', ChallengeSchema, {
  expires: {
    ttl: 300,
    attribute: 'expiresAt',
    items: {
      returnExpired: false,
    },
  },
});

export default Challenge;
