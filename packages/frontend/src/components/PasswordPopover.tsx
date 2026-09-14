import { FC } from 'react';
import get from 'lodash/get';
import { Check, X } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';
import { IRegisterFormInput } from '../pages/Register/types';

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

  if (!open) {
    return null;
  }

  return (
    <div className="fixed z-50 rounded-lg border bg-white shadow-lg p-3" 
      style={{
        position: 'fixed',
        left: anchorEl ? anchorEl.getBoundingClientRect().right + 10 : 0,
        top: anchorEl ? anchorEl.getBoundingClientRect().top + 20 : 0,
      }}>
      <div className="flex flex-col gap-2">
        {fieldValidationMessages.map((fieldValidationMessage) => (
          <div key={fieldValidationMessage} className="flex items-center gap-2">
            {fieldErrors.includes(fieldValidationMessage) ||
            !dirtyFields[fieldName] ? (
              <X className="h-4 w-4 text-destructive flex-shrink-0" />
            ) : (
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
            <p className="text-xs text-foreground">{fieldValidationMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordPopover;
