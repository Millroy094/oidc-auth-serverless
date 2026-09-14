import { FC, startTransition, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import getUsers from '../../../api/admin/get-users';
import useFeedback from '../../../hooks/useFeedback';
import deleteUser from '../../../api/admin/delete-user';
import { ClearAll, PersonRemove } from '@mui/icons-material';
import clearUserSessions from '../../../api/admin/clear-user-sessions';
import UserPopup from './UserPopup';
import { ADMIN_EMAIL } from '../../../constants';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { feedbackAxiosError, feedbackAxiosResponse } = useFeedback();

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.results);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving users, please try again',
      );
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await deleteUser(id);
      feedbackAxiosResponse(response, 'Successfully deleted user', 'success');
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the user, please try again',
      );
    }
  };

  const handleDeleteSessions = async (id: string): Promise<void> => {
    try {
      const response = await clearUserSessions(id);
      feedbackAxiosResponse(
        response,
        'Successfully deleted user sessions',
        'success',
      );
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the user sessions, please try again',
      );
    }
  };

  const handleRowClick = (params: GridRowParams) => {
    const { id, row } = params;
    const isAdmin = row?.email === ADMIN_EMAIL;

    if (!isAdmin) {
      startTransition(() => {
        setSelectedUserId(id as string);
        setOpen(true);
      });
    }
  };

  const onClose = () => {
    setOpen(false);
    setSelectedUserId('');
    fetchUsers();
  };

  const columns: GridColDef<(typeof users)[number]>[] = [
    {
      field: 'firstName',
      headerName: 'First Name',
      width: 180,
      editable: false,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 180,
      editable: false,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      editable: false,
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      width: 150,
      editable: false,
    },
    {
      field: 'id',
      headerName: '',
      width: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => {
        const isAdmin = params?.row?.email === ADMIN_EMAIL;
        return (
          <Grid container alignContent="center">
            <Grid item>
              <Tooltip title="Clear all sessions">
                <IconButton
                  disabled={isAdmin}
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSessions(params.value);
                  }}
                >
                  <ClearAll />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Delete user">
                <IconButton
                  disabled={isAdmin}
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(params.value);
                  }}
                >
                  <PersonRemove />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        );
      },
    },
  ];

  return (
    <Card elevation={0}>
      <CardHeader title="Users" />
      <CardContent>
        <DataGrid
          rows={users}
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
          onRowClick={handleRowClick}
        />
        <UserPopup
          open={open}
          userIdentifier={selectedUserId}
          onClose={onClose}
        />
      </CardContent>
    </Card>
  );
};

export default Users;
