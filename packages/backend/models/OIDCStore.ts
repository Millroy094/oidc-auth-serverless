import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { AdapterPayload } from 'oidc-provider';
import tableOptions from '../support/dynamoose-table-options.ts';
import logger from '../utils/logger.ts';

const { Schema, model } = dynamoose;

export interface OIDCStoreItem extends Item {
  id: string;
  payload: AdapterPayload;
  // Stored as epoch seconds, but dynamoose's `expires` option types this
  // attribute as Date, so reads return a Date instance.
  expiresAt?: number | Date;
  userCode?: string;
  uid?: string;
  grantId?: string;
  accountId?: string;
  sessionUid?: string;
}

const OIDCStoreSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    payload: {
      type: Object,
    },
    expiresAt: {
      type: Number,
    },
    userCode: {
      type: String,
      index: {
        name: 'userCode-index',
        type: 'global',
      },
    },
    uid: {
      type: String,
      index: {
        name: 'uid-index',
        type: 'global',
      },
    },
    grantId: {
      type: String,
      index: {
        name: 'grantId-index',
        type: 'global',
      },
    },
    accountId: {
      type: String,
      index: {
        name: 'accountId-index',
        type: 'global',
      },
    },
    sessionUid: {
      type: String,
      index: {
        name: 'sessionUid-index',
        type: 'global',
      },
    },
  },
  {
    timestamps: true,
    saveUnknown: ['payload.**'],
  },
);
const OIDCStore = model<OIDCStoreItem>('OIDCStore', OIDCStoreSchema, {
  ...tableOptions,
  expires: {
    // dynamoose's expires.ttl is in milliseconds, not seconds.
    ttl: 7 * 24 * 60 * 60 * 1000,
    attribute: 'expiresAt',
    items: {
      returnExpired: false,
    },
  },
}) as ReturnType<typeof model<OIDCStoreItem>> & {
  batchDeleteAll(ids: string[]): Promise<void>;
};

// DynamoDB's BatchWriteItem rejects requests over 25 items.
const DYNAMODB_BATCH_LIMIT = 25;

OIDCStore.methods.set('batchDeleteAll', async (ids: string[]) => {
  for (let i = 0; i < ids.length; i += DYNAMODB_BATCH_LIMIT) {
    const chunk = ids.slice(i, i + DYNAMODB_BATCH_LIMIT);
    const response = await OIDCStore.batchDelete(chunk);
    logger.info(
      `Successfully deleted items. ${response.unprocessedItems.length} of unprocessed items.`,
    );
  }
});

export default OIDCStore;
