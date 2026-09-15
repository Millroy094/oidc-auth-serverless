import get from 'lodash/get';
import { Check, X } from 'lucide-react';
import { FC } from 'react';
import { FieldErrors } from 'react-hook-form';
import { IRegisterFormInput } from '@/pages/Register/types';

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
  const fieldErrorsByType = get(errors, `${fieldName}.types`, {}) as Record<
    string,
    string | string[] | undefined
  >;
  const fieldErrors = Object.keys(fieldErrorsByType).reduce(
    (accumulatedErrors: string[], errorTypeKey: string): string[] => {
      const foundErrors = fieldErrorsByType[errorTypeKey];
      return foundErrors
        ? accumulatedErrors.concat(foundErrors)
        : accumulatedErrors;
    },
    [],
  );

  if (!open) {
    return null;
  }

  // On narrow screens there's no room to the right of the field, so stack
  // the popover below it instead of floating it off the edge of the viewport.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const rect = anchorEl?.getBoundingClientRect();
  const style = isMobile
    ? {
        position: 'fixed' as const,
        left: rect?.left ?? 0,
        top: (rect?.bottom ?? 0) + 8,
        width: rect?.width,
        maxWidth: 'calc(100vw - 2rem)',
      }
    : {
        position: 'fixed' as const,
        left: Math.min((rect?.right ?? 0) + 10, window.innerWidth - 272),
        top: (rect?.top ?? 0) + 20,
      };

  return (
    <div
      className="fixed z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg p-3"
      style={style}
    >
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
