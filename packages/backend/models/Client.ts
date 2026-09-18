import crypto from 'crypto';
import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ValueType } from 'dynamoose/dist/Schema';
import { v4 as uuid } from 'uuid';
import tableOptions from '../support/dynamoose-table-options.ts';
import { decryptData, encryptData } from '../utils/encryption.ts';
import { ResourceScope } from './Resource.ts';

const { Schema, model } = dynamoose;

export interface ClientItem extends Item {
  id: string;
  clientId: string;
  clientName: string;
  secret: string;
  grants: string[];
  scopes: string[];
  redirectUris: string[];
  resources: ResourceScope[];
  requirePkce: boolean;
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
      validate: (value: ValueType) =>
        (value as string[]).every((redirectUri) => {
          try {
            const url = new URL(redirectUri);
            const isLocalhost = ['localhost', '127.0.0.1'].includes(
              url.hostname,
            );
            return (
              url.protocol === 'https:' ||
              (url.protocol === 'http:' && isLocalhost)
            );
          } catch {
            return false;
          }
        }),
    },
    resources: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            id: { type: String },
            scopes: {
              type: Array,
              schema: [String],
            },
          },
        },
      ],
      default: [],
    },
    requirePkce: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);
const Client = model<ClientItem>('Client', ClientSchema, tableOptions);

export default Client;
