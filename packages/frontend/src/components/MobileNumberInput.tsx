import 'react-international-phone/style.css';

import React from 'react';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export interface MobileNumberInputProps {
  value: string;
  readOnly?: boolean;
  onChange: (phone: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  value,
  onChange,
  readOnly,
  label = 'Phone number',
  error,
  helperText,
}) => {
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: 'gb',
      value,
      countries: defaultCountries,
      onChange: (data) => {
        onChange(data.phone);
      },
    });

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="phone">{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={country.iso2}
          onValueChange={(value) => setCountry(value)}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full gap-1 px-2 sm:w-[7.5rem] sm:shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[12rem]">
            {defaultCountries.map((c) => {
              const countryData = parseCountry(c);
              return (
                <SelectItem key={countryData.iso2} value={countryData.iso2}>
                  <div className="flex items-center gap-2">
                    <FlagImage iso2={countryData.iso2} />
                    <span>+{countryData.dialCode}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Input
          id="phone"
          type="tel"
          placeholder="Phone number"
          value={inputValue}
          onChange={handlePhoneValueChange}
          ref={inputRef}
          readOnly={readOnly}
          className={error ? 'border-destructive' : ''}
        />
      </div>
      {helperText && (
        <p
          className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
