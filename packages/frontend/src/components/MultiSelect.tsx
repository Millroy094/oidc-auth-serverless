import { ChevronsUpDown, X } from 'lucide-react';
import { FC, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

export type MultiSelectOption = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  id?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
}

const MultiSelect: FC<MultiSelectProps> = (props) => {
  const {
    id,
    options,
    value = [],
    onChange,
    placeholder = 'Select...',
    className,
    invalid,
    disabled,
  } = props;
  const [open, setOpen] = useState(false);

  const toggleValue = (optionValue: string): void => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeValue = (optionValue: string, e: React.SyntheticEvent): void => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  return (
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-auto min-h-10 w-full min-w-0 justify-between whitespace-normal font-normal',
            invalid && 'border-destructive',
            className,
          )}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex min-w-0 flex-1 flex-wrap gap-1 py-0.5">
              {selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="max-w-full gap-1"
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeValue(option.value, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeValue(option.value, e);
                      }
                    }}
                    className="shrink-0 rounded-sm hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="max-h-60 overflow-y-auto">
          {options.map((option) => {
            const checked = value.includes(option.value);
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={checked}
                tabIndex={0}
                onClick={() => toggleValue(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleValue(option.value);
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-muted"
              >
                <Checkbox checked={checked} className="pointer-events-none" />
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
