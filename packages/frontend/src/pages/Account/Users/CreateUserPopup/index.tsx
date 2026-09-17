import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import schema from './schema';
import { ICreateUserPopupInput } from './type';
import createUser from '@/api/admin/create-user';
import getResources, {
  IAdminResourceListItem,
} from '@/api/admin/get-resources';
import ControlledSelect from '@/components/ControlledSelect';
import { MobileNumberInput } from '@/components/MobileNumberInput';
import ResourceScopesField from '@/components/ResourceScopesField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useFeedback from '@/hooks/useFeedback';

interface CreateUserPopupProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: ICreateUserPopupInput = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  roles: [],
  resources: [],
};

const CreateUserPopup: FC<CreateUserPopupProps> = (props) => {
  const { open, onClose } = props;
  const [resources, setResources] = useState<IAdminResourceListItem[]>([]);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ICreateUserPopupInput>({
    resolver: zodResolver(schema),
    criteriaMode: 'all',
    mode: 'onChange',
    defaultValues,
  });

  const handleClose = (): void => {
    reset(defaultValues);
    onClose();
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

  const onSubmit = async (data: ICreateUserPopupInput): Promise<void> => {
    try {
      const response = await createUser(data);
      feedbackAxiosResponse(
        response,
        'User created! They have been emailed instructions to set their password.',
        'success',
      );
      reset(defaultValues);
      onClose();
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue creating the user, please try again',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Add user</h2>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email Address
                  </label>
                  <Input {...register('email')} id="email" />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-1"
                    >
                      First Name
                    </label>
                    <Input {...register('firstName')} id="firstName" />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-1"
                    >
                      Last Name
                    </label>
                    <Input {...register('lastName')} id="lastName" />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <ControlledSelect
                  control={control}
                  name="roles"
                  label="Roles"
                  multiple
                  options={[
                    {
                      label: 'Admin',
                      value: 'admin',
                    },
                  ]}
                  errors={errors}
                />

                <Controller
                  name="mobile"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MobileNumberInput
                      label="Mobile Number"
                      onChange={onChange}
                      value={value ?? ''}
                      error={!!errors.mobile}
                      helperText={errors.mobile ? errors.mobile.message : ''}
                    />
                  )}
                />

                <ResourceScopesField
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  resources={resources}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserPopup;
