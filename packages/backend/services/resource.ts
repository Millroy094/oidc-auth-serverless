import isEmpty from 'lodash/isEmpty.js';
import Client from '../models/Client.ts';
import Resource, { ResourceItem } from '../models/Resource.ts';
import User from '../models/User.ts';

export class ResourceInUseError extends Error {
  public readonly clients: string[];

  public readonly users: string[];

  constructor(clients: string[], users: string[]) {
    const usages: string[] = [];

    if (clients.length > 0) {
      usages.push(`clients (${clients.join(', ')})`);
    }

    if (users.length > 0) {
      usages.push(`users (${users.join(', ')})`);
    }

    super(`Cannot delete resource: still assigned to ${usages.join(' and ')}`);

    this.clients = clients;
    this.users = users;
  }
}

class ResourceService {
  public static async createResource(fields: {
    id: string;
    name: string;
    scopes: string[];
  }): Promise<void> {
    const { id } = fields;
    const resource = await Resource.get(id);

    if (!isEmpty(resource)) {
      throw new Error('Resource already exists');
    }

    await Resource.create(fields);
  }

  public static async getResources(): Promise<ResourceItem[]> {
    const resources = await Resource.scan().exec();
    return resources;
  }

  public static async getResource(id: string): Promise<ResourceItem> {
    const resource = await Resource.get(id);

    if (isEmpty(resource)) {
      throw new Error('Resource does not exist');
    }

    return resource;
  }

  public static async updateResource(
    id: string,
    updatedFields: Record<string, unknown>,
  ): Promise<boolean> {
    await Resource.update(id, updatedFields);

    return true;
  }

  public static async deleteResource(id: string): Promise<boolean> {
    const resource = await this.getResource(id);

    const [clients, users] = await Promise.all([
      Client.scan().exec(),
      User.scan().exec(),
    ]);

    const clientsInUse = clients
      .filter((client) => client.resources?.some((r) => r.id === id))
      .map((client) => client.clientName);

    const usersInUse = users
      .filter((user) => user.resources?.some((r) => r.id === id))
      .map((user) => user.email);

    if (clientsInUse.length > 0 || usersInUse.length > 0) {
      throw new ResourceInUseError(clientsInUse, usersInUse);
    }

    await resource.delete();

    return true;
  }
}

export default ResourceService;
