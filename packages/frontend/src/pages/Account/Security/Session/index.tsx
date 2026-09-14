import { FC, useEffect, useState } from 'react';
import getUserSessions from '../../../../api/user/get-user-sessions';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../../../../components/ui/card';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import deleteUserSession from '../../../../api/user/delete-user-session';
import deleteAllUserSession from '../../../../api/user/delete-all-user-session';
import { isEmpty } from 'lodash';
import useFeedback from '../../../../hooks/useFeedback';

interface Session {
  id: string;
  loggedInAt: number;
  clients?: string[];
  iat: number;
  exp: number;
}

const Sessions: FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();

  const fetchSessions = async () => {
    try {
      const response = await getUserSessions();
      setSessions(response.data.sessions);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving user sessions, please try again',
      );
    }
  };

  useEffect(() => {
    fetchSessions();
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
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Manage user sessions</h2>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Clients</th>
                <th className="text-left py-3 px-4 font-medium">Logged in at</th>
                <th className="text-left py-3 px-4 font-medium">Started at</th>
                <th className="text-left py-3 px-4 font-medium">Expires at</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    {!isEmpty(session.clients) ? session.clients?.join(', ') : 'None'}
                  </td>
                  <td className="py-3 px-4">
                    {format(new Date(session.loggedInAt * 1000), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td className="py-3 px-4">
                    {format(new Date(session.iat * 1000), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td className="py-3 px-4">
                    {format(new Date(session.exp * 1000), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(session.id)}
                      title="Delete session"
                      className="p-1 text-red-600 hover:bg-red-100 rounded inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleDeleteAll}
          disabled={sessions.length === 0}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete all Session
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Sessions;
