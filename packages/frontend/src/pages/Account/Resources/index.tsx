import { Plus, Trash2, Server } from 'lucide-react';
import { FC, useEffect, useState, startTransition } from 'react';
import ResourcePopup from './ResourcePopup';
import deleteResource from '@/api/admin/delete-resource';
import getResources, {
  IAdminResourceListItem,
} from '@/api/admin/get-resources';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useFeedback from '@/hooks/useFeedback';

type Resource = IAdminResourceListItem;

const Resources: FC = () => {
  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { feedbackAxiosError, feedbackAxiosResponse } = useFeedback();

  const fetchResources = async () => {
    try {
      const response = await getResources();
      setResources(response.data.results ?? []);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving resources, please try again',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (id: string) => {
    startTransition(() => {
      setSelectedResourceId(id);
      setOpen(true);
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await deleteResource(id);
      feedbackAxiosResponse(
        response,
        'Successfully deleted resource',
        'success',
      );
      setResources(resources.filter((resource) => resource.id !== id));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the resource, please try again',
      );
    }
  };

  useEffect(() => {
    void fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = () => {
    setOpen(false);
    setSelectedResourceId('');
    void fetchResources();
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Resource Servers</CardTitle>
            <CardDescription>
              Manage the resource servers (APIs) this server issues access
              tokens for.
            </CardDescription>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create new Resource
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-160 text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      Identifier
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Scopes</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="last:border-b-0">
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="mx-auto h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="mt-3 border-t pt-3">
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : resources.length === 0 ? (
          <div className="rounded-lg border py-10 px-4 text-center text-muted-foreground">
            No resources yet. Create one to get started.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-160 text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      Identifier
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Scopes</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr
                      key={resource.id}
                      onClick={() => handleRowClick(resource.id)}
                      className="last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">{resource.id}</td>
                      <td className="py-3 px-4">{resource.name}</td>
                      <td className="py-3 px-4">
                        {resource.scopes.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(resource.id);
                          }}
                          title="Delete Resource"
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
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(resource.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(resource.id);
                    }
                  }}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{resource.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {resource.id}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(resource.id);
                      }}
                      title="Delete Resource"
                      className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 border-t pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Scopes: {resource.scopes.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <ResourcePopup
          open={open}
          resourceIdentifier={selectedResourceId}
          onClose={onClose}
        />
      </CardContent>
    </Card>
  );
};

export default Resources;
