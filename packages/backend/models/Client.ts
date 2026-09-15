import crypto from 'crypto';
import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ValueType } from 'dynamoose/dist/Schema';
import { v4 as uuid } from 'uuid';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

export interface ClientItem extends Item {
  id: string;
  clientId: string;
  clientName: string;
  secret: string;
  grants: string[];
  scopes: string[];
  redirectUris: string[];
}

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
const Client = model<ClientItem>('Client', ClientSchema);

export default Client;
