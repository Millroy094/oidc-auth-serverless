import { zodResolver } from '@hookform/resolvers/zod';
import { uniqueId } from 'lodash';
import get from 'lodash/get';
import has from 'lodash/has';
import { Plus, Trash2, Server } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import schema from './schema';
import { IResourcePopupInput } from './type';
import createResource from '@/api/admin/create-resource';
import getResource from '@/api/admin/get-resource';
import updateResource from '@/api/admin/update-resource';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import UrlProtocolField from '@/components/UrlProtocolField';
import useFeedback from '@/hooks/useFeedback';

interface ResourcePopupProps {
  open: boolean;
  resourceIdentifier: string;
  onClose: () => void;
}

const defaultValues: IResourcePopupInput = {
  id: '',
  name: '',
  scopes: [{ id: uniqueId(), value: '' }],
};

const ResourcePopup: FC<ResourcePopupProps> = (props) => {
  const { resourceIdentifier, open, onClose } = props;
  const [resource, setResource] = useState<IResourcePopupInput>(defaultValues);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IResourcePopupInput>({
    resolver: zodResolver(schema),
    criteriaMode: 'all',
    mode: 'onChange',
    values: resource,
  });

  const handleClose = (): void => {
    setResource(defaultValues);
    onClose();
  };

  const fetchResource = async (id: string): Promise<void> => {
    try {
      const response = await getResource(id);
      setResource({
        id: response.data.resource.id,
        name: response.data.resource.name,
        scopes: response.data.resource.scopes.map((scope: string) => ({
          id: uniqueId(),
          value: scope,
        })),
      });
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving the resource, please try again',
      );
      handleClose();
    }
  };

  useEffect(() => {
    if (open && resourceIdentifier) {
      void fetchResource(resourceIdentifier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resourceIdentifier]);

  const {
    fields: scopeFields,
    append: addScope,
    remove: removeScope,
  } = useFieldArray<IResourcePopupInput>({
    control,
    name: 'scopes',
  });

  const canDeleteScopes = scopeFields.length > 1;

  const isLastScope = (index: number): boolean =>
    scopeFields.length - 1 === index;

  const onSubmit = async (data: IResourcePopupInput): Promise<void> => {
    try {
      let response;
      const scopes = data.scopes.map((scope) => scope.value);
      if (!resourceIdentifier) {
        response = await createResource({ ...data, scopes });
      } else {
        response = await updateResource(resourceIdentifier, {
          ...data,
          scopes,
        });
      }
      feedbackAxiosResponse(
        response,
        `Successfully ${!resourceIdentifier ? 'created' : 'updated'} resource`,
        'success',
      );
      reset();
      handleClose();
    } catch (err) {
      feedbackAxiosError(
        err,
        `There was an issue ${
          !resourceIdentifier ? 'creating' : 'updating'
        } the resource, please try again`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">
                {`${!resourceIdentifier ? 'Create' : 'Update'} Resource`}
              </h2>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="id"
                    className="block text-sm font-medium mb-1"
                  >
                    Identifier (https URL)
                  </label>
                  <UrlProtocolField
                    control={control}
                    name="id"
                    protocols={['https://']}
                    disabled={!!resourceIdentifier}
                    invalid={!!errors.id}
                    placeholder="api.example.com"
                  />
                  {errors.id && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Name
                  </label>
                  <Input {...register('name')} id="name" />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {scopeFields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <label
                        htmlFor={`scope-${index}`}
                        className="block text-sm font-medium"
                      >
                        Scope {index + 1}
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          {...register(`scopes.${index}.value`)}
                          id={`scope-${index}`}
                          placeholder="orders:read"
                          className="flex-1"
                        />
                        <div className="flex shrink-0 items-center gap-1">
                          {isLastScope(index) && (
                            <button
                              type="button"
                              onClick={() =>
                                addScope({ id: uniqueId(), value: '' })
                              }
                              className="p-2 text-green-600 hover:bg-green-100 rounded"
                              title="Add"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteScopes && (
                            <button
                              type="button"
                              onClick={() => removeScope(index)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {has(errors, `scopes.${index}.value`) && (
                        <p className="text-sm text-red-500">
                          {get(errors, `scopes.${index}.value.message`, '')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button type="submit">
                {`${!resourceIdentifier ? 'Create' : 'Update'} Resource`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcePopup;
