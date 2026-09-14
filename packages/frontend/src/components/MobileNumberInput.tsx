import 'react-international-phone/style.css';

import { Input } from './ui/input';
import React from 'react';
import {
  CountryIso2,
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';

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
      <div className="flex gap-2">
        <Select value={country.iso2} onValueChange={(value) => setCountry(value as CountryIso2)} disabled={readOnly}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
      {helperText && <p className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{helperText}</p>}
    </div>
  );
};
