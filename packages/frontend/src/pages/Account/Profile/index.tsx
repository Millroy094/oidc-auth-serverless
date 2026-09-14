import { FC, useEffect, useState } from 'react';
import {
  Button,
  Grid,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
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
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Typography variant="h6">Account Profile</Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container direction="column" spacing={2}>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                {...register('firstName')}
                InputLabelProps={{ shrink: true }}
                label="First Name"
                variant="outlined"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName ? errors.firstName.message : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                {...register('lastName')}
                InputLabelProps={{ shrink: true }}
                label="Last Name"
                variant="outlined"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName ? errors.lastName.message : ''}
              />
            </Grid>
          </Grid>
          <Grid item>
            <TextField
              {...register('email')}
              InputLabelProps={{ shrink: true }}
              label="Email Address"
              variant="outlined"
              fullWidth
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
              disabled
            />
          </Grid>
          <Grid item>
            <Controller
              name="emailVerified"
              control={control}
              render={({ field: { onChange, value, disabled } }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={value}
                      onChange={onChange}
                      disabled={disabled}
                    />
                  }
                  label="Email verified?"
                />
              )}
            />
          </Grid>
          <Grid item>
            <Controller
              name="mobile"
              control={control}
              render={({ field: { onChange, value, disabled } }) => (
                <MobileNumberInput
                  InputLabelProps={{ shrink: true }}
                  label="Mobile Number"
                  variant="outlined"
                  fullWidth
                  onChange={onChange}
                  value={value ?? ''}
                  error={!!errors.mobile}
                  helperText={errors.mobile ? errors.mobile.message : ''}
                  readOnly={disabled ?? false}
                />
              )}
            />
          </Grid>

          <Grid item alignSelf="flex-end">
            {disabled ? (
              <Button
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  setDisabled(false);
                }}
                startIcon={<Edit />}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                type="submit"
                startIcon={<Save />}
              >
                Update Profile
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Profile;
