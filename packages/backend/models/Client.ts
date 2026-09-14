import dynamoose from 'dynamoose';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { ValueType } from 'dynamoose/dist/Schema';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

const ClientSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => uuid(),
    },
    clientId: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      default: () => crypto.randomBytes(32).toString('base64'),
      set: (value: ValueType) => encryptData(value as string),
      get: (value: ValueType) => decryptData(value as string),
    },
    grants: {
      type: Array,
      schema: [String],
      required: true,
    },
    scopes: {
      type: Array,
      schema: [String],
      required: true,
    },
    redirectUris: {
      type: Array,
      schema: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
const Client = model('Client', ClientSchema);

export default Client;
