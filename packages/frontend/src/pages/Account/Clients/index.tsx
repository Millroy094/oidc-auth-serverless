import { FC, useEffect, useState, startTransition } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Plus, Copy, Trash2 } from 'lucide-react';
import ClientPopup from './ClientPopup';
import getClients from '../../../api/admin/get-clients';
import deleteClient from '../../../api/admin/delete-client';
import useFeedback from '../../../hooks/useFeedback';

interface Client {
  id: string;
  name: string;
  secret: string;
  clientId: string;
  clientName: string;
}

const Clients: FC = () => {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { feedbackAxiosError, feedbackAxiosResponse } = useFeedback();

  const fetchClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data.results);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving clients, please try again',
      );
    }
  };

  const handleRowClick = (id: string) => {
    startTransition(() => {
      setSelectedClientId(id);
      setOpen(true);
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await deleteClient(id);
      feedbackAxiosResponse(response, 'Successfully deleted cleint', 'success');
      setClients(clients.filter((client) => client.id !== id));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the client, please try again',
      );
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = () => {
    setOpen(false);
    setSelectedClientId('');
    fetchClients();
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create new Client
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Client ID</th>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Secret</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => handleRowClick(client.id)}
                  className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="py-3 px-4">{client.clientId || client.id}</td>
                  <td className="py-3 px-4">{client.clientName || client.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">****</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(client.secret);
                        }}
                        title="Copy Secret"
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        <Copy className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client.id);
                      }}
                      title="Delete Client"
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ClientPopup
          open={open}
          clientIdentifier={selectedClientId}
          onClose={onClose}
        />
      </CardContent>
    </Card>
  );
};

export default Clients;
