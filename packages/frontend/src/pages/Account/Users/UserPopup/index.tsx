import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { UserCircle } from 'lucide-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import schema from './schema';
import { IUserPopupInput } from './type';
import getUser from '@/api/admin/get-user';
import resetMfa from '@/api/admin/reset-mfa';
import updateUser from '@/api/admin/update-user';
import ControlledSelect from '@/components/ControlledSelect';
import { MobileNumberInput } from '@/components/MobileNumberInput';
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

interface UserPopupProps {
  open: boolean;
  userIdentifier: string;
  onClose: () => void;
}

const defaultValues: IUserPopupInput = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  roles: [],
  emailVerified: false,
  suspended: false,
  lastLoggedIn: 0,
};

const UserPopup: FC<UserPopupProps> = (props) => {
  const { userIdentifier, open, onClose } = props;
  const [user, setUser] = useState<IUserPopupInput>(defaultValues);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const {
    watch,
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IUserPopupInput>({
    resolver: zodResolver(schema),
    criteriaMode: 'all',
    mode: 'onChange',
    values: user,
  });

  const lastLoggedIn = watch('lastLoggedIn', 0);

  const lastLoggedInAsDate = useMemo(
    () =>
      lastLoggedIn
        ? format(new Date(lastLoggedIn), 'dd/MM/yyyy HH:mm:ss')
        : 'Never',
    [lastLoggedIn],
  );

  const handleClose = (): void => {
    setUser(defaultValues);
    onClose();
  };

  const fetchUser = async (id: string): Promise<void> => {
    try {
      const response = await getUser(id);
      setUser({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        email: response.data.user.email,
        mobile: response.data.user.mobile,
        roles: response.data.user.roles,
        emailVerified: response.data.user.emailVerified,
        suspended: response.data.user.suspended,
        lastLoggedIn: response.data.user.lastLoggedIn ?? 0,
      });
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving the user, please try again',
      );
      handleClose();
    }
  };

  const onResetMFA = async (): Promise<void> => {
    try {
      const response = await resetMfa(userIdentifier);
      feedbackAxiosResponse(response, 'Successfully reset MFA!', 'success');
    } catch (err) {
      feedbackAxiosError(err, 'Failed to reset MFA');
    }
  };

  useEffect(() => {
    if (open && userIdentifier) {
      void fetchUser(userIdentifier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userIdentifier]);

  const onSubmit = async (data: IUserPopupInput): Promise<void> => {
    try {
      const response = await updateUser(userIdentifier, data);
      feedbackAxiosResponse(response, 'Successfully updated user', 'success');
      reset();
      handleClose();
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue updating the user, please try again',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Update user</h2>
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
                  <Input {...register('email')} id="email" disabled />
                  <p className="text-xs text-slate-500 mt-1">
                    Last login: {lastLoggedInAsDate}
                  </p>
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

                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <label
                    htmlFor="emailVerified"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Controller
                      name="emailVerified"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <input
                          id="emailVerified"
                          type="checkbox"
                          checked={value}
                          onChange={onChange}
                          className="w-4 h-4"
                        />
                      )}
                    />
                    <span className="text-sm">Email verified?</span>
                  </label>
                  <label
                    htmlFor="suspended"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Controller
                      name="suspended"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <input
                          id="suspended"
                          type="checkbox"
                          checked={value}
                          onChange={onChange}
                          className="w-4 h-4"
                        />
                      )}
                    />
                    <span className="text-sm">Suspended?</span>
                  </label>
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
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onResetMFA}>
                Reset MFA
              </Button>
              <Button type="submit">Update User</Button>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UserPopup;
