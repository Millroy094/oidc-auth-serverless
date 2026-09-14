import ClientService from './client.ts';
import Client from '../models/Client.ts';

jest.mock('../models/Client');

describe('ClientService', () => {
  const clientData = {
    clientId: '12345',
    clientName: 'Test Client',
    scopes: ['scope1', 'scope2'],
    grants: ['grant1', 'grant2'],
    redirectUris: ['https://example.com/callback'],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClient', () => {
    it('should throw an error if client already exists', async () => {
      (Client.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([clientData]),
        }),
      });

      await expect(ClientService.createClient(clientData)).rejects.toThrow(
        'Client already exists',
      );
    });

    it('should create a new client if it does not exist', async () => {
      (Client.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      (Client.create as jest.Mock).mockResolvedValue(clientData);

      await ClientService.createClient(clientData);
      expect(Client.create).toHaveBeenCalledWith(clientData);
    });
  });

  describe('getClients', () => {
    it('should return a list of clients', async () => {
      const clients = [clientData];
      (Client.scan as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(clients),
      });

      const result = await ClientService.getClients();
      expect(result).toEqual(clients);
      expect(Client.scan().exec).toHaveBeenCalled();
    });
  });

  describe('getClientById', () => {
    it('should return the client with the specified ID', async () => {
      (Client.get as jest.Mock).mockResolvedValue(clientData);

      const result = await ClientService.getClientById('12345');
      expect(result).toEqual(clientData);
      expect(Client.get).toHaveBeenCalledWith('12345');
    });

    it('should throw an error if the client does not exist', async () => {
      (Client.get as jest.Mock).mockResolvedValue(null);

      await expect(
        ClientService.getClientById('nonexistent-id'),
      ).rejects.toThrow('User does not exists');
    });
  });

  describe('updateClient', () => {
    it('should update the client and return true', async () => {
      (Client.update as jest.Mock).mockResolvedValue(true);

      const result = await ClientService.updateClient('12345', {
        clientName: 'Updated Client Name',
      });
      expect(result).toBe(true);
      expect(Client.update).toHaveBeenCalledWith('12345', {
        clientName: 'Updated Client Name',
      });
    });
  });

  describe('deleteClients', () => {
    it('should delete the client and return true', async () => {
      (Client.get as jest.Mock).mockResolvedValue({
        delete: jest.fn().mockResolvedValue(true),
      });

      const result = await ClientService.deleteClients('12345');
      expect(result).toBe(true);
      expect(Client.get).toHaveBeenCalledWith('12345');
    });

    it('should throw an error if the client does not exist when deleting', async () => {
      (Client.get as jest.Mock).mockResolvedValue(null);

      await expect(
        ClientService.deleteClients('nonexistent-id'),
      ).rejects.toThrow('User does not exists');
    });
  });
});
