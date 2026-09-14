import isEmpty from 'lodash/isEmpty.js';
import { AnyItem } from 'dynamoose/dist/Item';
import Client from '../models/Client.ts';

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

  public static async getClients(): Promise<AnyItem[]> {
    const clients = await Client.scan().exec();
    return clients;
  }

  public static async getClientById(id: string): Promise<AnyItem> {
    const client = await Client.get(id);

    if (isEmpty(client)) {
      throw new Error('User does not exists');
    }

    return client;
  }

  public static async updateClient(
    id: string,
    updatedFields: any,
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
