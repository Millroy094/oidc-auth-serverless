import isEmpty from 'lodash/isEmpty.js';
import { ClientMetadata } from 'oidc-provider';
import Client, { ClientItem } from '../models/Client.ts';

class ClientService {
  public static async createClient(fields: {
    clientId: string;
    clientName: string;
    scopes: string[];
    grants: string[];
    redirectUris: string[];
    requirePkce?: boolean;
  }): Promise<void> {
    const { clientId } = fields;
    const clientAccount = await this.getClientByClientId(clientId);

    if (!isEmpty(clientAccount)) {
      throw new Error('Client already exists');
    }

    await Client.create(fields);
  }

  public static async getClients(): Promise<ClientItem[]> {
    return Client.scan().exec();
  }

  public static async getClientById(id: string): Promise<ClientItem> {
    const client = await Client.get(id);

    if (isEmpty(client)) {
      throw new Error('User does not exists');
    }

    return client;
  }

  public static async getClientByClientId(
    clientId: string,
  ): Promise<ClientItem | undefined> {
    const [client] = await Client.query('clientId')
      .using('clientId-index')
      .eq(clientId)
      .exec();

    return client;
  }

  // Maps our persisted Client record onto the shape oidc-provider expects
  // when resolving a client via the adapter's `find('Client', id)` path.
  public static toClientMetadata(client: ClientItem): ClientMetadata {
    return {
      client_id: client.clientId,
      client_secret: client.secret,
      redirect_uris: client.redirectUris,
      grant_types: client.grants,
      scope: client.scopes.join(' '),
      resources: client.resources,
      require_pkce: client.requirePkce,
    };
  }

  public static async updateClient(
    id: string,
    updatedFields: Record<string, unknown>,
  ): Promise<boolean> {
    await Client.update(id, updatedFields);

    return true;
  }

  public static async deleteClients(id: string): Promise<boolean> {
    const client = await this.getClientById(id);
    await client.delete();

    return true;
  }
}

export default ClientService;
