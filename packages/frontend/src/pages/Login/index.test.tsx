import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './index';
import { useAuth } from '../../context/AuthProvider';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import getLoginConfiguration from '../../api/user/get-login-configuration';

vi.mock('../../context/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../api/user/get-login-configuration');

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    (getLoginConfiguration as jest.Mock).mockResolvedValue({
      data: { emailVerified: true, mfa: { enabled: false } },
    });
  });

  it('renders the Login component', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('submits the login form', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    act(() => {
      fireEvent.input(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' },
      });

      fireEvent.click(screen.getByText('Next'));
    });

    await waitFor(() => {
      expect(getLoginConfiguration).toHaveBeenCalledWith('test@example.com');
    });

    act(() => {
      fireEvent.input(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByText('Sign in'));
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        loginWithRecoveryCode: false,
        otp: '',
        email: 'test@example.com',
        password: 'password123',
        recoveryCode: '',
        resetMfa: false,
      });
    });
  });

  it('handles MFA flow', async () => {
    (getLoginConfiguration as jest.Mock).mockResolvedValueOnce({
      data: { emailVerified: true, mfa: { enabled: true, type: 'app' } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.input(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(getLoginConfiguration).toHaveBeenCalledWith('test@example.com');
    });

    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Please enter the 6 digit passcode shown on your authenticator app',
        ),
      ).toBeInTheDocument();
    });
  });
});
