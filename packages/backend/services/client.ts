import isEmpty from 'lodash/isEmpty.js';
import Client, { ClientItem } from '../models/Client.ts';

class ClientService {
  public static async createClient(fields: {
    clientId: string;
    clientName: string;
    scopes: string[];
    grants: string[];
    redirectUris: string[];
  }): Promise<void> {
    const { clientId } = fields;
    const [clientAccount] = await Client.scan('clientId').eq(clientId).exec();

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
