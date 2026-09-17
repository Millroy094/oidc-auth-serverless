import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';
import MultiSelect from './MultiSelect';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type ControlledSelectOption = {
  label: string;
  value: string;
};

interface ControlledSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  multiple?: boolean;
  options: ControlledSelectOption[];
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  disabled?: boolean;
}

const ControlledSelect = <TFieldValues extends FieldValues>(
  props: ControlledSelectProps<TFieldValues>,
) => {
  const { name, control, label, options, errors, multiple, disabled } = props;
  const id = label.toLocaleLowerCase();

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Controller
        render={({ field }) =>
          multiple ? (
            <MultiSelect
              id={id}
              options={options}
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder={`Select ${label.toLowerCase()}`}
              invalid={!!errors[name]}
              disabled={disabled}
            />
          ) : (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                className={errors[name] ? 'border-destructive' : ''}
              >
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
          )
        }
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
