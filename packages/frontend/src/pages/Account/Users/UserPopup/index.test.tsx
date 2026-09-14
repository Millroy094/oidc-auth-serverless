import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserPopup from './index';
import * as getUserApi from '../../../../api/admin/get-user';
import * as mfaApi from '../../../../api/admin/reset-mfa';
import { vi, expect } from 'vitest';

vi.mock('../../../../api/admin/update-user');
vi.mock('../../../../api/admin/get-user');
vi.mock('../../../../api/admin/reset-mfa');
vi.mock('../../../../hooks/useFeedback', () => ({
  __esModule: true, // Ensure it is treated as an ES module
  default: () => ({
    feedbackAxiosError: vi.fn(),
    feedbackAxiosResponse: vi.fn(),
  }),
}));

describe('UserPopup', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    (getUserApi.default as jest.Mock).mockResolvedValue({
      data: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '1234567890',
          roles: [],
          emailVerified: false,
          suspended: false,
          lastLoggedIn: 0,
        },
      },
    });
  });

  it('renders correctly when opened', async () => {
    render(<UserPopup open={true} userIdentifier="1" onClose={mockOnClose} />);

    expect(screen.getByText('Update user')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument();
  });

  it('resets MFA when the button is clicked', async () => {
    (mfaApi.default as jest.Mock).mockResolvedValue({ data: {} }); // Mock successful MFA reset response
    render(<UserPopup open={true} userIdentifier="1" onClose={mockOnClose} />);

    await waitFor(() =>
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Reset MFA/i }));

    await waitFor(() => {
      expect(mfaApi.default).toHaveBeenCalledWith('1');
    });
  });
});
