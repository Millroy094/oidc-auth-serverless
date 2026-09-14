import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PasswordField from './PasswordField';
import { UseFormRegister } from 'react-hook-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRegister = vi.fn() as unknown as UseFormRegister<any>;

describe('PasswordField', () => {
  const defaultProps = {
    register: mockRegister,
    name: 'password',
    label: 'Password',
    error: false,
    helperText: '',
  };

  it('renders PasswordField with correct label', () => {
    render(<PasswordField {...defaultProps} name="password" />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('displays helper text and error state', () => {
    render(
      <PasswordField
        {...defaultProps}
        name="password"
        error={true}
        helperText="Password is required"
      />,
    );
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('toggles password visibility when icon is clicked', () => {
    render(<PasswordField {...defaultProps} name="password" />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const visibilityToggle = screen.getByRole('button', {
      name: /toggle password visibility/i,
    });

    expect(passwordInput.type).toBe('password');

    fireEvent.click(visibilityToggle);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(visibilityToggle);
    expect(passwordInput.type).toBe('password');
  });

  it('registers the input with react-hook-form', () => {
    render(<PasswordField {...defaultProps} name="password" />);
    expect(mockRegister).toHaveBeenCalledWith(defaultProps.name);
  });
});
