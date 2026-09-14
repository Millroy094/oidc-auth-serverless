import { FC, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Edit, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
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
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-lg font-semibold">Account Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
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

          <div className="flex items-center gap-2">
            <Controller
              name="emailVerified"
              control={control}
              render={({ field: { onChange, value } }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Email verified?</span>
                </label>
              )}
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium mb-1">
              Mobile Number
            </label>
            <Controller
              name="mobile"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <MobileNumberInput
                    label="Mobile Number"
                    onChange={onChange}
                    value={value ?? ''}
                    error={!!errors.mobile}
                    helperText={errors.mobile ? errors.mobile.message : ''}
                    readOnly={disabled ?? false}
                  />
                </>
              )}
            />
          </div>

          <div className="flex justify-end">
            {disabled ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setDisabled(false);
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                type="submit"
                variant="default"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Update Profile
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
