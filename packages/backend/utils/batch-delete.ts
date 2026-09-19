import OIDCStore from '../models/OIDCStore.ts';
import logger from './logger.ts';

// DynamoDB's BatchWriteItem rejects requests with more than 25 items, so IDs
// must be deleted in chunks of 25 rather than in a single batchDelete call.
const DYNAMODB_BATCH_LIMIT = 25;

const batchDeleteChunked = async (ids: string[]): Promise<void> => {
  for (let i = 0; i < ids.length; i += DYNAMODB_BATCH_LIMIT) {
    const chunk = ids.slice(i, i + DYNAMODB_BATCH_LIMIT);
    const response = await OIDCStore.batchDelete(chunk);
    logger.info(
      `Successfully deleted items. ${response.unprocessedItems.length} of unprocessed items.`,
    );
  }
};

export default batchDeleteChunked;
