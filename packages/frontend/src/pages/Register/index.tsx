import React, { FC } from 'react';
import {
  Link,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { omit } from 'lodash';
import PasswordField from '../../components/PasswordField';
import schema from './schema';
import PasswordPopover from '../../components/PasswordPopover';
import registerUser from '../../api/user/register-user';
import { useNavigate } from 'react-router-dom';
import useFeedback from '../../hooks/useFeedback';
import { MobileNumberInput } from '../../components/MobileNumberInput';
import { IRegisterFormInput } from './types';

const StyledCard = styled(Card)({
  borderTop: '2px solid red',
});

const Register: FC = () => {
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<IRegisterFormInput>({
    resolver: yupResolver(schema, {}),
    criteriaMode: 'all',
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
    },
  });

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.target.parentElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSubmit = async (data: IRegisterFormInput): Promise<void> => {
    try {
      const response = await registerUser(omit(data, 'confirmPassword'));
      feedbackAxiosResponse(
        response,
        'Successfully registered user',
        'success',
      );
      reset();
      navigate('/login');
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue registering the user, please try again',
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <StyledCard sx={{ marginTop: 15 }}>
        <CardHeader
          title="Register a new user"
          titleTypographyProps={{ align: 'center' }}
          subheader={
            <>
              <Typography variant="caption">Already registered?</Typography>
              <Link
                variant="caption"
                underline="none"
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/login')}
              >
                Click here
              </Link>
              <Typography variant="caption">to login</Typography>
            </>
          }
          subheaderTypographyProps={{
            display: 'flex',
            gap: '4px',
            justifyContent: 'center',
          }}
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container direction="column" spacing={2} sx={{ p: 2 }}>
              <Grid item container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    {...register('firstName')}
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
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ''}
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
              <Grid item>
                <PasswordField
                  name="password"
                  label="Password"
                  onFocus={handleFocus}
                  onBlur={handleClose}
                  register={register}
                  error={!!errors.password}
                />
              </Grid>
              <Grid item>
                <PasswordField
                  name="confirmPassword"
                  label="Confirm Password"
                  onFocus={handleFocus}
                  onBlur={handleClose}
                  register={register}
                  error={!!errors.confirmPassword}
                />
              </Grid>
              <Grid item alignSelf="flex-end">
                <Button variant="contained" color="error" type="submit">
                  Register
                </Button>
              </Grid>
            </Grid>
          </form>
          <PasswordPopover
            open={open}
            anchorEl={anchorEl}
            errors={errors}
            dirtyFields={dirtyFields}
          />
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default Register;
