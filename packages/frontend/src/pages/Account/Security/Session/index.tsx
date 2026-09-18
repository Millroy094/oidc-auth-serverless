import { format } from 'date-fns';
import { isEmpty } from 'lodash';
import { Trash2, Monitor } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import deleteAllUserSession from '@/api/user/delete-all-user-session';
import deleteUserSession from '@/api/user/delete-user-session';
import getUserSessions from '@/api/user/get-user-sessions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useFeedback from '@/hooks/useFeedback';

interface Session {
  id: string;
  loggedInAt: number;
  clients?: string[];
  iat: number;
  exp: number;
}

const Sessions: FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();

  const fetchSessions = async () => {
    try {
      const response = await getUserSessions();
      setSessions(response.data.sessions ?? []);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving user sessions, please try again',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (sessionId: string): Promise<void> => {
    try {
      const response = await deleteUserSession(sessionId);
      feedbackAxiosResponse(
        response,
        'Successfully deleted session',
        'success',
      );
      setSessions(sessions.filter((session) => session.id !== sessionId));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the session, please try again',
      );
    }
  };

  const handleDeleteAll = async (): Promise<void> => {
    try {
      const response = await deleteAllUserSession();
      feedbackAxiosResponse(
        response,
        'Successfully deleted all sessions',
        'success',
      );
      setSessions([]);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting all sessions, please try again',
      );
    }
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Monitor className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Active Sessions</CardTitle>
          <CardDescription>
            These are the devices and applications currently signed in to your
            account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Clients</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Logged in at
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Started at
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Expires at
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-32" />
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
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border py-10 px-4 text-center text-muted-foreground">
            No active sessions.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Clients</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Logged in at
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Started at
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Expires at
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {!isEmpty(session.clients)
                          ? session.clients?.join(', ')
                          : 'None'}
                      </td>
                      <td className="whitespace-nowrap py-3 px-4">
                        {format(
                          new Date(session.loggedInAt * 1000),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </td>
                      <td className="whitespace-nowrap py-3 px-4">
                        {format(
                          new Date(session.iat * 1000),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </td>
                      <td className="whitespace-nowrap py-3 px-4">
                        {format(
                          new Date(session.exp * 1000),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(session.id)}
                          title="Delete session"
                          className="p-1 text-destructive hover:bg-destructive/10 rounded inline-flex"
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
              {sessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate font-medium">
                      {!isEmpty(session.clients)
                        ? session.clients?.join(', ')
                        : 'None'}
                    </p>
                    <button
                      onClick={() => handleDelete(session.id)}
                      title="Delete session"
                      className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <dl className="mt-3 space-y-1.5 border-t pt-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Logged in at</dt>
                      <dd>
                        {format(
                          new Date(session.loggedInAt * 1000),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Started at</dt>
                      <dd>
                        {format(
                          new Date(session.iat * 1000),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Expires at</dt>
                      <dd>
                        {format(
                          new Date(session.exp * 1000),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleDeleteAll}
          disabled={sessions.length === 0}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete all Sessions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Sessions;
