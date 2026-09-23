import * as React from 'react';
import { Input, type InputProps } from './input';

interface EnterableInputProps extends InputProps {
  onEnter?: () => void;
}

const EnterableInput = React.forwardRef<HTMLInputElement, EnterableInputProps>(
  ({ onEnter, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
      }
      onKeyDown?.(e);
    };

    return <Input ref={ref} onKeyDown={handleKeyDown} {...props} />;
  },
);

EnterableInput.displayName = 'EnterableInput';

export { EnterableInput };
