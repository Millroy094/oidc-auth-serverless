import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface UrlProtocolFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  protocols?: string[];
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
}

// A URL text field that keeps the protocol as a fixed, separately-handled
// prefix rather than making the user type it out. When only one protocol is
// allowed (the default, "https://") it's shown as a static, non-editable
// badge. When multiple protocols are passed in (e.g. to also allow
// "http://" for localhost redirect URIs) it becomes a small picker instead.
// The underlying form value is always the full URL string (protocol included).
const UrlProtocolField = <TFieldValues extends FieldValues>(
  props: UrlProtocolFieldProps<TFieldValues>,
) => {
  const {
    control,
    name,
    protocols = ['https://'],
    disabled,
    invalid,
    placeholder,
    className,
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string | undefined) ?? '';
        const protocol =
          protocols.find((candidate) => value.startsWith(candidate)) ??
          protocols[0];
        const rest = value.startsWith(protocol)
          ? value.slice(protocol.length)
          : value;

        return (
          <div className={`flex ${className ?? ''}`}>
            {protocols.length > 1 ? (
              <Select
                value={protocol}
                onValueChange={(newProtocol) =>
                  field.onChange(`${newProtocol}${rest}`)
                }
                disabled={disabled}
              >
                <SelectTrigger className="w-28 shrink-0 rounded-r-none border-r-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((candidate) => (
                    <SelectItem key={candidate} value={candidate}>
                      {candidate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="flex shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                {protocol}
              </span>
            )}
            <Input
              value={rest}
              onChange={(e) => field.onChange(`${protocol}${e.target.value}`)}
              onBlur={field.onBlur}
              disabled={disabled}
              placeholder={placeholder}
              className={`flex-1 rounded-l-none ${invalid ? 'border-destructive' : ''}`}
            />
          </div>
        );
      }}
    />
  );
};

export default UrlProtocolField;
