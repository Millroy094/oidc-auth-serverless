import { FC, useEffect, useState } from 'react';
import getUserSessions from '../../../../api/user/get-user-sessions';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete } from '@mui/icons-material';
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

  const columns: GridColDef<(typeof sessions)[number]>[] = [
    {
      field: 'clients',
      headerName: 'Clients',
      width: 200,
      editable: false,
      renderCell: (params) =>
        !isEmpty(params.value) ? params.value.join(', ') : 'None',
    },
    {
      field: 'loggedInAt',
      headerName: 'Logged in at',
      width: 180,
      editable: false,
      valueFormatter: (value) =>
        format(new Date(value * 1000), 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      field: 'iat',
      headerName: 'Started at',
      width: 180,
      editable: false,
      valueFormatter: (value) =>
        format(new Date(value * 1000), 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      field: 'exp',
      headerName: 'Expires at',
      width: 180,
      editable: false,
      valueFormatter: (value) =>
        format(new Date(value * 1000), 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      field: 'id',
      headerName: '',
      width: 10,
      editable: false,
      renderCell: (params) => (
        <Tooltip title="Delete session">
          <IconButton color="error" onClick={() => handleDelete(params.value)}>
            <Delete />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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
    <Card elevation={0}>
      <CardHeader
        title="Manage user sessions"
        action={
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteAll}
            disabled={sessions.length === 0}
          >
            Delete all Session
          </Button>
        }
      />
      <CardContent>
        <DataGrid
          rows={sessions}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </CardContent>
    </Card>
  );
};

export default Sessions;
