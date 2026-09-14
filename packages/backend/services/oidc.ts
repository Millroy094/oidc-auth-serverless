import { ObjectType } from 'dynamoose/dist/General';
import { QueryResponse, ScanResponse } from 'dynamoose/dist/ItemRetriever';
import { AnyItem } from 'dynamoose/dist/Item';
import OIDCStore from '../models/OIDCStore.ts';

interface Session {
  id: string;
  loggedInAt?: number;
  clients?: string[];
  iat: number;
  exp: number;
}

class OIDCService {
  public static async getSessions(userId: string): Promise<Session[]> {
    const sessionResponse = await OIDCStore.scan('payload.accountId')
      .eq(userId)
      .and()
      .where('payload.kind')
      .eq('Session')
      .exec();
    const sessions = sessionResponse.toJSON().map((session: ObjectType) => ({
      id: session.payload.jti,
      loggedInAt: session.payload.loginTs,
      clients: Object.keys(session?.payload?.authorizations ?? {}),
      iat: session.payload.iat,
      exp: session.payload.exp,
    }));
    return sessions;
  }

  public static async deleteAllSessions(userId: string): Promise<true> {
    const results = await OIDCStore.scan('payload.accountId')
      .eq(userId)
      .or()
      .where('payload.session.accountId')
      .eq(userId)
      .exec();

    await OIDCService.deleteAllResults(results);

    return true;
  }

  public static async deleteSession(sessionId: string): Promise<true> {
    const [session] = await OIDCStore.scan('payload.jti').eq(sessionId).exec();

    if (session) {
      const apps = session?.payload?.authorizations ?? {};

      for (const key of Object.keys(apps)) {
        const { grantId } = apps[key];

        if (grantId) {
          const grantables = await OIDCStore.scan('grantId').eq(grantId).exec();
          await OIDCService.deleteAllResults(grantables);
          await OIDCStore.delete(`Grant:${grantId}`);
        }
      }

      const [interaction] = await OIDCStore.scan('payload.kind')
        .eq('Interaction')
        .and()
        .where('payload.session.uid')
        .eq(session.uid)
        .exec();

      if (interaction) {
        await interaction.delete();
      }

      await session.delete();
    }

    return true;
  }

  public static async deleteAllResults(
    results: QueryResponse<AnyItem> | ScanResponse<AnyItem>,
  ): Promise<void> {
    if (results.count > 0) {
      const modelIds = results.toJSON().reduce((ids: string[], result) => {
        ids.push(result.id);
        return ids;
      }, []);

      const response = await OIDCStore.batchDelete(modelIds);
      console.log(
        `Successfully deleted items. ${response.unprocessedItems.length} of unprocessed items.`,
      );
    }
  }
}

export default OIDCService;
