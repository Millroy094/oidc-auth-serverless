import { Adapter, AdapterPayload } from 'oidc-provider';
import logger from '../utils/logger.ts';
import OIDCStore from '../models/OIDCStore.ts';

class DynamoDBAdapter implements Adapter {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async upsert(
    id: string,
    payload: AdapterPayload,
    expiresIn: number,
  ): Promise<void | undefined> {
    const modelId = `${this.name}:${id}`;
    try {
      const expiresAt = expiresIn
        ? Math.floor(Date.now() / 1000) + expiresIn
        : null;

      await OIDCStore.update(modelId, {
        payload: { ...payload },
        ...(expiresAt ? { expiresAt } : {}),
        ...(payload.userCode ? { userCode: payload.userCode } : {}),
        ...(payload.uid ? { uid: payload.uid } : {}),
        ...(payload.grantId ? { grantId: payload.grantId } : {}),
      });
    } catch (error) {
      logger.error((error as Error).message);
      throw new Error(`There was an error updating ${modelId}`);
    }
  }

  async find(id: string): Promise<void | AdapterPayload | undefined> {
    const modelId = `${this.name}:${id}`;
    try {
      const record = await OIDCStore.get(modelId);

      // DynamoDB can take upto 48 hours to drop expired items, so a check is required
      if (
        !record ||
        (record.expiresAt && Date.now() > record.expiresAt * 1000)
      ) {
        return undefined;
      }

      return record.payload;
    } catch (error) {
      logger.error((error as Error).message);
      throw new Error(`There was an error finding ${modelId}`);
    }
  }
  async findByUserCode(
    userCode: string,
  ): Promise<void | AdapterPayload | undefined> {
    try {
      const [record] = await OIDCStore.scan('userCode').eq(userCode).exec();

      // DynamoDB can take upto 48 hours to drop expired items, so a check is required
      if (
        !record ||
        (record.expiresAt && Date.now() > record.expiresAt * 1000)
      ) {
        return undefined;
      }

      return record.payload;
    } catch (error) {
      logger.error((error as Error).message);
      throw new Error(
        `There was an error finding record by user code ${userCode}`,
      );
    }
  }
  async findByUid(uid: string): Promise<void | AdapterPayload | undefined> {
    try {
      const [record] = await OIDCStore.scan('uid').eq(uid).exec();
      // DynamoDB can take upto 48 hours to drop expired items, so a check is required
      if (
        !record ||
        (record.expiresAt && Date.now() > record.expiresAt * 1000)
      ) {
        return undefined;
      }

      return record.payload;
    } catch (error: any) {
      logger.error((error as Error).message);
      throw new Error(`There was an error finding record by uid ${uid}`);
    }
  }
  async consume(id: string): Promise<void | undefined> {
    const modelId = `${this.name}:${id}`;
    try {
      const record = await OIDCStore.get(modelId);
      record.payload = {
        ...record.payload,
        consumed: Math.floor(Date.now() / 1000),
      };
      await record.save();
    } catch (error) {
      logger.error((error as Error).message);
      throw new Error(`There was an error marking ${modelId} as consumed`);
    }
  }
  async destroy(id: string): Promise<void | undefined> {
    const modelId = `${this.name}:${id}`;
    try {
      await OIDCStore.delete(modelId);
    } catch (error) {
      logger.error((error as Error).message);
      throw new Error(`There was an error deleting ${modelId}`);
    }
  }
  async revokeByGrantId(grantId: string): Promise<void | undefined> {
    try {
      const results = await OIDCStore.scan('grantId').eq(grantId).exec();

      if (!results || !results.length) {
        return;
      }

      const modelIds = results.toJSON().reduce((ids: string[], result) => {
        ids.push(result.id);
        return ids;
      }, []);

      const response = await OIDCStore.batchDelete(modelIds);
      logger.info(
        `Successfully deleted items. ${response.unprocessedItems.length} of unprocessed items.`,
      );
    } catch (error) {
      logger.error((error as Error).message);
      throw new Error(`There was an error revoking by ${grantId}`);
    }
  }
}

export default DynamoDBAdapter;
