/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
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
  const { name, control, label, options, multiple, errors } = props;
  const id = label.toLocaleLowerCase();
  const labelId = `${id}-label`;
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        render={({ field }) => (
          <Select
            labelId={labelId}
            id={id}
            label={label}
            multiple={multiple}
            {...field}
            error={!!errors[name]}
          >
            {options.map(({ label, value }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        )}
        name={name}
        control={control}
      />
      {errors && errors[name] && (
        <FormHelperText error>
          {(errors[name]?.message as string) ?? ''}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default ControlledSelect;
