import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ValueType } from 'dynamoose/dist/Schema';
import tableOptions from '../support/dynamoose-table-options.ts';

const { Schema, model } = dynamoose;

export interface ResourceItem extends Item {
  id: string;
  name: string;
  scopes: string[];
}

export interface ResourceScope {
  id: string;
  scopes: string[];
}

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*)*$/;

const ResourceSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
      validate: (value: ValueType) => {
        try {
          const url = new URL(value as string);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      },
    },
    name: {
      type: String,
      required: true,
    },
    scopes: {
      type: Array,
      schema: [String],
      required: true,
      validate: (value: ValueType) =>
        (value as string[]).every((scope) => SCOPE_REGEX.test(scope)),
    },
  },
  {
    timestamps: true,
  },
);
const Resource = model<ResourceItem>('Resource', ResourceSchema, tableOptions);

export default Resource;
