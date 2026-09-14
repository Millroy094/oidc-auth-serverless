import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { FC } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';

type ControlledSelectOption = {
  label: string;
  value: string;
};

interface ControlledSelectProps {
  name: string;
  label: string;
  multiple?: boolean;
  options: ControlledSelectOption[];
  control: Control<any>;
  errors: FieldErrors<any>;
}

const ControlledSelect: FC<ControlledSelectProps> = (props) => {
  const { name, control, label, options, errors } = props;
  const id = label.toLocaleLowerCase();

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Controller
        render={({ field }) => (
          <>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={id} className={errors[name] ? 'border-destructive' : ''}>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        name={name}
        control={control}
      />
      {errors && errors[name] && (
        <p className="text-sm text-destructive">
          {(errors[name]?.message as string) ?? ''}
        </p>
      )}
    </div>
  );
};

export default ControlledSelect;
