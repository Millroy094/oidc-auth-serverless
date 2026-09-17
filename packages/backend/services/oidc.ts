import { QueryResponse, ScanResponse } from 'dynamoose/dist/ItemRetriever';
import DynamoDbAdapter from '../adapter/DynamoDbAdapter.ts';
import OIDCStore, { OIDCStoreItem } from '../models/OIDCStore.ts';
import logger from '../utils/logger.ts';

const grantAdapter = new DynamoDbAdapter('Grant');

interface Session {
  id: string;
  loggedInAt?: number;
  clients?: string[];
  iat: number;
  exp: number;
}

class OIDCService {
  public static async getSessions(userId: string): Promise<Session[]> {
    const sessionResponse = await OIDCStore.query('accountId')
      .using('accountId-index')
      .eq(userId)
      .and()
      .where('payload.kind')
      .eq('Session')
      .exec();
    const sessions = sessionResponse.map((session) => ({
      id: session.payload.jti as string,
      loggedInAt: session.payload.loginTs,
      clients: Object.keys(session.payload.authorizations ?? {}),
      iat: session.payload.iat as number,
      exp: session.payload.exp as number,
    }));
    return sessions;
  }

  public static async deleteAllSessions(userId: string): Promise<true> {
    const results = await OIDCStore.query('accountId')
      .using('accountId-index')
      .eq(userId)
      .exec();

    await OIDCService.deleteAllResults(results);

    return true;
  }

  public static async deleteSession(sessionId: string): Promise<true> {
    const session = await OIDCStore.get(`Session:${sessionId}`);

    if (session) {
      const apps = session?.payload?.authorizations ?? {};

      for (const key of Object.keys(apps)) {
        const { grantId } = apps[key];

        if (grantId) {
          await grantAdapter.revokeByGrantId(grantId);
          await OIDCStore.delete(`Grant:${grantId}`);
        }
      }

      const [interaction] = await OIDCStore.query('sessionUid')
        .using('sessionUid-index')
        .eq(session.uid)
        .and()
        .where('payload.kind')
        .eq('Interaction')
        .exec();

      if (interaction) {
        await interaction.delete();
      }

      await session.delete();
    }

    return true;
  }

  public static async deleteAllResults(
    results: QueryResponse<OIDCStoreItem> | ScanResponse<OIDCStoreItem>,
  ): Promise<void> {
    if (results.count > 0) {
      const modelIds = results.reduce((ids: string[], result) => {
        ids.push(result.id);
        return ids;
      }, []);

      const response = await OIDCStore.batchDelete(modelIds);
      logger.info(
        `Successfully deleted items. ${response.unprocessedItems.length} of unprocessed items.`,
      );
    }
  }
}

export default OIDCService;
