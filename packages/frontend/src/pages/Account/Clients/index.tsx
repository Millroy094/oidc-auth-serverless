import { Plus, Copy, Check, Trash2, Briefcase } from 'lucide-react';
import { FC, useEffect, useState, startTransition } from 'react';
import ClientPopup from './ClientPopup';
import deleteClient from '@/api/admin/delete-client';
import getClients, { IAdminClientListItem } from '@/api/admin/get-clients';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import useFeedback from '@/hooks/useFeedback';

type Client = IAdminClientListItem;

const Clients: FC = () => {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const { feedbackAxiosError, feedbackAxiosResponse, feedback } = useFeedback();

  const fetchClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data.results ?? []);
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

  const handleCopySecret = (id: string, secret: string): void => {
    void navigator.clipboard.writeText(secret);
    feedback('Secret copied to clipboard', 'success');
    setCopiedClientId(id);
    setTimeout(() => setCopiedClientId(null), 1500);
  };

  useEffect(() => {
    void fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = () => {
    setOpen(false);
    setSelectedClientId('');
    void fetchClients();
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Clients</CardTitle>
            <CardDescription>
              Manage the OAuth/OIDC applications registered with this server.
            </CardDescription>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create new Client
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="rounded-lg border py-10 px-4 text-center text-muted-foreground">
            No clients yet. Create one to get started.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-160 text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      Client ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Secret</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => handleRowClick(client.id)}
                      className="last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        {client.clientId || client.id}
                      </td>
                      <td className="py-3 px-4">{client.clientName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">****</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopySecret(client.id, client.secret);
                            }}
                            title="Copy Secret"
                            className="rounded p-1 transition-all hover:scale-110 hover:bg-muted active:scale-95"
                          >
                            {copiedClientId === client.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(client.id);
                          }}
                          title="Delete Client"
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {clients.map((client) => (
                <div
                  key={client.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(client.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(client.id);
                    }
                  }}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {client.clientName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {client.clientId || client.id}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(client.id);
                      }}
                      title="Delete Client"
                      className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Secret: ****
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySecret(client.id, client.secret);
                      }}
                      title="Copy Secret"
                      className="flex items-center gap-1 rounded p-1 text-xs text-primary transition-all hover:scale-105 hover:bg-muted active:scale-95"
                    >
                      {copiedClientId === client.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
