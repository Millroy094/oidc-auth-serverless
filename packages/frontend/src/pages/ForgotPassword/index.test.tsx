import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './index';
import sendOtp from '../../api/user/send-otp';
import useFeedback from '../../hooks/useFeedback';
import { vi, expect } from 'vitest';

vi.mock('../../api/user/send-otp');
vi.mock('../../api/user/change-password');
vi.mock('../../hooks/useFeedback');

describe('ForgotPassword Component', () => {
  const mockFeedback = vi.fn();
  const mockFeedbackAxiosError = vi.fn();
  const mockFeedbackAxiosResponse = vi.fn();

  beforeEach(() => {
    (useFeedback as jest.Mock).mockReturnValue({
      feedback: mockFeedback,
      feedbackAxiosError: mockFeedbackAxiosError,
      feedbackAxiosResponse: mockFeedbackAxiosResponse,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('sends an email for password reset when email is submitted', async () => {
    (sendOtp as jest.Mock).mockResolvedValueOnce({}); // Mock successful OTP sending

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(sendOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        type: 'forgot_password',
      });
      expect(mockFeedback).toHaveBeenCalledWith(
        'An email with a code to reset password has been send to your email. Please use this code to reset your password.',
        'info',
      );
    });
  });

  it('shows an error message when sending OTP fails', async () => {
    (sendOtp as jest.Mock).mockRejectedValueOnce(new Error('Failed to send'));

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(mockFeedbackAxiosError).toHaveBeenCalledWith(
        expect.any(Error),
        'Failed to send password reset email',
      );
    });
  });
});
