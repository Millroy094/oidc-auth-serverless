import { FC } from 'react';
import get from 'lodash/get';
import { Grid, Popper, Typography, styled } from '@mui/material';
import { Close, Check } from '@mui/icons-material';
import { FieldErrors } from 'react-hook-form';
import { grey } from '@mui/material/colors';
import { IRegisterFormInput } from '../pages/Register/types';

const StyledPopper = styled(Popper)(({ theme }) => ({
  backgroundColor: `${theme.palette.mode === 'dark' ? grey[900] : '#fff'}`,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]}`,
  boxShadow: `${
    theme.palette.mode === 'dark'
      ? '0px 4px 8px rgb(0 0 0 / 0.7)'
      : '0px 4px 8px rgb(0 0 0 / 0.1)'
  }`,
  padding: '0.75rem',
  color: `${theme.palette.mode === 'dark' ? grey[100] : grey[700]}`,
  fontSize: '0.875rem',
  opacity: 1,
  margin: '0.25rem 0',
}));

interface PasswordPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  errors: FieldErrors<IRegisterFormInput>;
  dirtyFields: Record<string, boolean>;
}

const passwordFieldValidationMessages = {
  password: [
    'Password is required',
    'Must Contain 8 Characters',
    'Must Contain One Lowercase Character',
    'Must Contain One Uppercase Character',
    'Must Contain One Number Character',
    'Must Contain  One Special Case Character',
  ],
  confirmPassword: [
    'Password confirmation is required',
    'Passwords must match',
  ],
};

const PasswordPopover: FC<PasswordPopoverProps> = (props) => {
  const { open, anchorEl, errors, dirtyFields } = props;

  const fieldName = anchorEl?.firstElementChild?.getAttribute('name') ?? '';

  const fieldValidationMessages = get(
    passwordFieldValidationMessages,
    fieldName,
    [],
  );

  if (fieldValidationMessages.length === 0) {
    return null;
  }
  const fieldErrorsByType = get(errors, `${fieldName}.types`, {});
  const fieldErrors = Object.keys(fieldErrorsByType).reduce(
    (errors: string[], errorTypeKey: string): string[] => {
      const foundErrors = get(fieldErrorsByType, errorTypeKey);
      return foundErrors ? errors.concat(foundErrors) : errors;
    },
    [],
  );

  return (
    <StyledPopper
      open={open}
      anchorEl={anchorEl}
      placement="right"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [-10, 20],
          },
        },
      ]}
    >
      <Grid container direction="column" sx={{ p: '10px' }}>
        {fieldValidationMessages.map((fieldValidationMessage) => (
          <Grid key={fieldValidationMessage} container item alignItems="center">
            {fieldErrors.includes(fieldValidationMessage) ||
            !dirtyFields[fieldName] ? (
              <Close color="error" />
            ) : (
              <Check color="success" />
            )}
            <Typography sx={{ p: '5px' }}>{fieldValidationMessage}</Typography>
          </Grid>
        ))}
      </Grid>
    </StyledPopper>
  );
};

export default PasswordPopover;
