import { FC, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  Modal,
  Switch,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { AccountCircle } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';
import updateUser from '../../../../api/admin/update-user';
import useFeedback from '../../../../hooks/useFeedback';
import getUser from '../../../../api/admin/get-user';
import { MobileNumberInput } from '../../../../components/MobileNumberInput';
import ControlledSelect from '../../../../components/ControlledSelect';
import { IUserPopupInput } from './type';
import resetMfa from '../../../../api/admin/reset-mfa';

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
    resolver: yupResolver(schema),
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
      fetchUser(userIdentifier);
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
                <AccountCircle color="primary" fontSize="large" />
              </Grid>
              <Grid item>Update user</Grid>
            </Grid>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField
                  {...register('email')}
                  InputLabelProps={{ shrink: true }}
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  helperText={`Last login: ${lastLoggedInAsDate}`}
                  disabled
                />
              </Grid>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    {...register('firstName')}
                    InputLabelProps={{ shrink: true }}
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={
                      errors.firstName ? errors.firstName.message : ''
                    }
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
              <Grid container item>
                <Grid item>
                  <Controller
                    name="emailVerified"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={<Switch checked={value} onChange={onChange} />}
                        label="Email verified?"
                      />
                    )}
                  />
                </Grid>
                <Grid item>
                  <Controller
                    name="suspended"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={<Switch checked={value} onChange={onChange} />}
                        label="Suspended?"
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item>
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
              </Grid>

              <Grid item>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MobileNumberInput
                      InputLabelProps={{ shrink: true }}
                      label="Mobile Number"
                      variant="outlined"
                      fullWidth
                      onChange={onChange}
                      value={value ?? ''}
                      error={!!errors.mobile}
                      helperText={errors.mobile ? errors.mobile.message : ''}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid item container justifyContent="flex-end" spacing={1}>
              <Grid item>
                <Button variant="contained" color="error" onClick={onResetMFA}>
                  Reset MFA
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="success" type="submit">
                  Update User
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </form>
      </Card>
    </Modal>
  );
};

export default UserPopup;
