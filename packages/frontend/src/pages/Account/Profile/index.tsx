import { FC, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { BadgeCheck, BadgeX, Edit, Save, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import schema from './schema';
import getUserProfileDetails from '../../../api/user/get-user-profile-details';
import updateUserProfileDetails from '../../../api/user/update-user-profile-details';
import useFeedback from '../../../hooks/useFeedback';
import { MobileNumberInput } from '../../../components/MobileNumberInput';
import { IProfileFormInput } from './types';

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  emailVerified: false,
  mobile: '',
};

const Profile: FC = () => {
  const [form, setForm] = useState(defaultValues);
  const [disabled, setDisabled] = useState(true);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const fetchData = async () => {
    try {
      const response = await getUserProfileDetails();
      const user = response?.data?.user;
      setForm({
        firstName: user?.firstName ?? defaultValues.firstName,
        lastName: user?.lastName ?? defaultValues.lastName,
        email: user?.email ?? defaultValues.email,
        emailVerified: user?.emailVerified ?? defaultValues.emailVerified,
        mobile: user?.mobile ?? defaultValues.mobile,
      });
    } catch (err) {
      feedbackAxiosError(
        err,
        'Failed to retreive user data, please reload the page.',
      );
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProfileFormInput>({
    resolver: yupResolver(schema, {}),
    disabled,
    defaultValues,
    values: form,
  });

  const onSubmit = async (data: IProfileFormInput): Promise<void> => {
    try {
      const response = await updateUserProfileDetails(data);
      setDisabled(true);
      feedbackAxiosResponse(
        response,
        'Successfully updated user details',
        'success',
      );
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue updating the user details, please try again',
      );
    }
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-col items-start gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl">Account Profile</CardTitle>
          <CardDescription>
            Manage your personal details and how we can reach you.
          </CardDescription>
        </div>
        {disabled ? (
          <Button
            type="button"
            onClick={() => setDisabled(false)}
            className="gap-2 w-full sm:w-auto"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDisabled(true);
              setForm({ ...form });
            }}
            className="gap-2 w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <Input
                  {...register('firstName')}
                  id="firstName"
                  placeholder="First Name"
                  disabled={disabled}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <Input
                  {...register('lastName')}
                  id="lastName"
                  placeholder="Last Name"
                  disabled={disabled}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
          </section>

          <div className="border-t" />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    form.emailVerified ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {form.emailVerified ? (
                    <BadgeCheck className="w-3.5 h-3.5" />
                  ) : (
                    <BadgeX className="w-3.5 h-3.5" />
                  )}
                  {form.emailVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <Input
                {...register('email')}
                id="email"
                placeholder="Email Address"
                disabled
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {!disabled && (
              <Controller
                name="emailVerified"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <Checkbox
                      checked={value}
                      onCheckedChange={onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Mark email as verified</span>
                  </label>
                )}
              />
            )}

            <div>
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
                    readOnly={disabled ?? false}
                  />
                )}
              />
            </div>
          </section>

          {!disabled && (
            <div className="flex justify-end">
              <Button type="submit" variant="default" className="gap-2">
                <Save className="w-4 h-4" />
                Update Profile
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default Profile;
