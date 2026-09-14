import { FC, useEffect, useState, startTransition } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddBusiness, Delete, ContentCopy } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import ClientPopup from './ClientPopup';
import getClients from '../../../api/admin/get-clients';
import deleteClient from '../../../api/admin/delete-client';
import useFeedback from '../../../hooks/useFeedback';

interface Client {
  id: string;
  name: string;
  secret: string;
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

  const handleRowClick = (params: GridRowParams) => {
    const { id } = params;
    startTransition(() => {
      setSelectedClientId(id as string);
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

  const columns: GridColDef<(typeof clients)[number]>[] = [
    {
      field: 'clientId',
      headerName: 'Client ID',
      width: 275,
      editable: false,
    },
    {
      field: 'clientName',
      headerName: 'Name',
      width: 275,
      editable: false,
    },

    {
      field: 'secret',
      headerName: 'Secret',
      width: 200,
      editable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ userSelect: 'none' }}
          >
            ************************
          </Typography>
          <Tooltip title="Copy Secret">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(params.value);
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'id',
      headerName: '',
      width: 10,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Delete Client">
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.value);
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card elevation={0}>
      <CardHeader
        title="Clients"
        action={
          <Button
            variant="outlined"
            color="success"
            startIcon={<AddBusiness />}
            onClick={() => setOpen(true)}
          >
            Create new Client
          </Button>
        }
      />
      <CardContent>
        <DataGrid
          rows={clients}
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
