import { zodResolver } from '@hookform/resolvers/zod';
import { snakeCase, uniqueId } from 'lodash';
import get from 'lodash/get';
import has from 'lodash/has';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import schema from './schema';
import { IClientPopupInput } from './type';
import createClient from '@/api/admin/create-client';
import getClient from '@/api/admin/get-client';
import getResources, {
  IAdminResourceListItem,
} from '@/api/admin/get-resources';
import updateClient from '@/api/admin/update-client';
import ControlledSelect from '@/components/ControlledSelect';
import ResourceScopesField from '@/components/ResourceScopesField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import UrlProtocolField from '@/components/UrlProtocolField';
import useFeedback from '@/hooks/useFeedback';

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
  resources: [],
  requirePkce: true,
};

const ClientPopup: FC<ClientPopupProps> = (props) => {
  const { clientIdentifier, open, onClose } = props;
  const [client, setClient] = useState<IClientPopupInput>(defaultValues);
  const [resources, setResources] = useState<IAdminResourceListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    resolver: zodResolver(schema),
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
      setIsLoading(true);
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
        resources: response.data.client.resources,
        requirePkce: response.data.client.requirePkce,
      });
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving the client, please try again',
      );
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async (): Promise<void> => {
    try {
      const response = await getResources();
      setResources(response.data.results);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving resources, please try again',
      );
    }
  };

  useEffect(() => {
    if (open) {
      void fetchResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && clientIdentifier) {
      void fetchClient(clientIdentifier);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">
                {`${!clientIdentifier ? 'Create' : 'Update'} Client`}
              </h2>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="clientId"
                      className="block text-sm font-medium mb-1"
                    >
                      Client Id
                    </label>
                    <Input {...register('clientId')} id="clientId" disabled />
                  </div>

                  <div>
                    <label
                      htmlFor="clientName"
                      className="block text-sm font-medium mb-1"
                    >
                      Client Name
                    </label>
                    <Input
                      {...register('clientName')}
                      id="clientName"
                      disabled={!!clientIdentifier}
                    />
                    {errors.clientName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.clientName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
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
                    </div>
                    <div>
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
                    </div>
                  </div>

                  <div className="space-y-3">
                    {redirectUriFields.map((field, index) => (
                      <div key={field.id} className="space-y-1">
                        <label
                          htmlFor={`redirectUri-${index}`}
                          className="block text-sm font-medium"
                        >
                          Redirect URI {index + 1}
                        </label>
                        <div className="flex items-center gap-2">
                          <UrlProtocolField
                            control={control}
                            name={`redirectUris.${index}.value`}
                            protocols={['https://', 'http://']}
                            invalid={has(errors, `redirectUris.${index}.value`)}
                            className="flex-1"
                          />
                          <div className="flex shrink-0 items-center gap-1">
                            {isLastRedirectUri(index) && (
                              <button
                                type="button"
                                onClick={() =>
                                  addRedirectUri({ id: uniqueId(), value: '' })
                                }
                                className="p-2 text-green-600 hover:bg-green-100 rounded"
                                title="Add"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            {canDeleteRedirectUris && (
                              <button
                                type="button"
                                onClick={() => removeRedirectUri(index)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {has(errors, `redirectUris.${index}.value`) && (
                          <p className="text-sm text-red-500">
                            {get(
                              errors,
                              `redirectUris.${index}.value.message`,
                              '',
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <ResourceScopesField
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                    resources={resources}
                  />

                  <div className="flex items-start gap-2">
                    <Controller
                      name="requirePkce"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="requirePkce"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      )}
                    />
                    <div>
                      <label
                        htmlFor="requirePkce"
                        className="block text-sm font-medium cursor-pointer"
                      >
                        Require PKCE
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Recommended for all clients. Only disable this for
                        confidential clients that cannot support PKCE.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {`${!clientIdentifier ? 'Create' : 'Update'} Client`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ClientPopup;
