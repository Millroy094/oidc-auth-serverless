import { FC, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Modal,
  TextField,
} from '@mui/material';
import { AddLinkRounded, Business, Delete } from '@mui/icons-material';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';
import has from 'lodash/has';
import get from 'lodash/get';
import { snakeCase, uniqueId } from 'lodash';

import ControlledSelect from '../../../../components/ControlledSelect';
import createClient from '../../../../api/admin/create-client';
import getClient from '../../../../api/admin/get-client';
import updateClient from '../../../../api/admin/update-client';
import useFeedback from '../../../../hooks/useFeedback';
import { IClientPopupInput } from './type';

interface ClientPopupProps {
  open: boolean;
  clientIdentifier: string;
  onClose: () => void;
}

const defaultValues: IClientPopupInput = {
  clientId: '',
  clientName: '',
  grants: [],
  scopes: [],
  redirectUris: [{ id: uniqueId(), value: '' }],
};

const ClientPopup: FC<ClientPopupProps> = (props) => {
  const { clientIdentifier, open, onClose } = props;
  const [client, setClient] = useState<IClientPopupInput>(defaultValues);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IClientPopupInput>({
    resolver: yupResolver(schema),
    criteriaMode: 'all',
    mode: 'onChange',
    values: client,
  });

  const handleClose = (): void => {
    setClient(defaultValues);
    onClose();
  };

  const fetchClient = async (id: string): Promise<void> => {
    try {
      const response = await getClient(id);
      setClient({
        clientId: response.data.client.clientId,
        clientName: response.data.client.clientName,
        grants: response.data.client.grants,
        scopes: response.data.client.scopes,
        redirectUris: response.data.client.redirectUris.map((uri: string) => ({
          id: uniqueId(),
          value: uri,
        })),
      });
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving the client, please try again',
      );
      handleClose();
    }
  };

  useEffect(() => {
    if (open && clientIdentifier) {
      fetchClient(clientIdentifier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientIdentifier]);

  const clientName = watch('clientName', '');

  useEffect(() => {
    setValue('clientId', snakeCase(clientName));
  }, [clientName, setValue]);

  const {
    fields: redirectUriFields,
    append: addRedirectUri,
    remove: removeRedirectUri,
  } = useFieldArray<IClientPopupInput>({
    control,
    name: 'redirectUris',
  });

  const canDeleteRedirectUris = redirectUriFields.length > 1;

  const isLastRedirectUri = (index: number): boolean =>
    redirectUriFields.length - 1 === index;

  const onSubmit = async (data: IClientPopupInput): Promise<void> => {
    try {
      let response;
      if (!clientIdentifier) {
        response = await createClient({
          ...data,
          redirectUris: data.redirectUris.map(
            (redirectUri) => redirectUri.value,
          ),
        });
      } else {
        response = await updateClient(clientIdentifier, {
          ...data,
          redirectUris: data.redirectUris.map(
            (redirectUri) => redirectUri.value,
          ),
        });
      }
      feedbackAxiosResponse(
        response,
        `Successfully ${!clientIdentifier ? 'created' : 'updated'} client`,
        'success',
      );
      reset();
      handleClose();
    } catch (err) {
      feedbackAxiosError(
        err,
        `There was an issue ${
          !clientIdentifier ? 'creating' : 'updating'
        } the client, please try again`,
      );
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <CardHeader
          title={
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Business color="primary" fontSize="large" />
              </Grid>
              <Grid item>
                {`${!clientIdentifier ? 'Create' : 'Update'} Client`}
              </Grid>
            </Grid>
          }
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField
                  {...register('clientId')}
                  label="Client Id"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item>
                <TextField
                  {...register('clientName')}
                  label="Client Name"
                  variant="outlined"
                  fullWidth
                  disabled={!!clientIdentifier}
                  error={!!errors.clientName}
                  helperText={
                    errors.clientName ? errors.clientName.message : ''
                  }
                />
              </Grid>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <ControlledSelect
                    control={control}
                    name="grants"
                    label="Grants"
                    multiple
                    options={[
                      {
                        label: 'Authorization Code Flow',
                        value: 'authorization_code',
                      },
                      {
                        label: 'Refresh Token',
                        value: 'refresh_token',
                      },
                      {
                        label: 'Client Credentials',
                        value: 'client_credentials',
                      },
                    ]}
                    errors={errors}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ControlledSelect
                    control={control}
                    name="scopes"
                    label="Scopes"
                    multiple
                    options={[
                      { label: 'Open ID', value: 'openid' },
                      { label: 'Email', value: 'email' },
                      { label: 'Phone', value: 'phone' },
                      { label: 'Profile', value: 'profile' },
                      { label: 'Offline Access', value: 'offline_access' },
                    ]}
                    errors={errors}
                  />
                </Grid>
                <Grid item container direction="column" spacing={2}>
                  {redirectUriFields.map((field, index) => (
                    <Grid
                      container
                      item
                      key={field.id}
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Grid item xs={10}>
                        <TextField
                          {...register(`redirectUris.${index}.value`)}
                          label={`Redirect URI ${index + 1}`}
                          variant="outlined"
                          fullWidth
                          error={has(errors, `redirectUris.${index}.value`)}
                          helperText={get(
                            errors,
                            `redirectUris.${index}.value.message`,
                            '',
                          )}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Card
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            p: '10px 0',
                            gap: '6px',
                          }}
                        >
                          {isLastRedirectUri(index) && (
                            <IconButton
                              size="small"
                              aria-label="add"
                              color="success"
                              onClick={() =>
                                addRedirectUri({ id: uniqueId(), value: '' })
                              }
                            >
                              <AddLinkRounded />
                            </IconButton>
                          )}
                          {isLastRedirectUri(index) &&
                            canDeleteRedirectUris && (
                              <Divider orientation="vertical" flexItem />
                            )}
                          {canDeleteRedirectUris && (
                            <IconButton
                              size="small"
                              aria-label="remove"
                              color="error"
                              onClick={() => removeRedirectUri(index)}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Card>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid item container justifyContent="flex-end">
              <Button variant="contained" color="success" type="submit">
                {`${!clientIdentifier ? 'Create' : 'Update'} Client`}
              </Button>
            </Grid>
          </CardActions>
        </form>
      </Card>
    </Modal>
  );
};

export default ClientPopup;
