import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect } from 'vitest';
import Users from './index';
import getUsers from '../../../api/admin/get-users';
import * as deleteUserApi from '../../../api/admin/delete-user';
import * as clearUserSessionsApi from '../../../api/admin/clear-user-sessions';

// Mocking the API calls
vi.mock('../../../api/admin/get-users');
vi.mock('../../../api/admin/delete-user');
vi.mock('../../../api/admin/clear-user-sessions');
vi.mock('../../../hooks/useFeedback', () => ({
  __esModule: true, // Ensure it is treated as an ES module
  default: () => ({
    feedbackAxiosError: vi.fn(),
    feedbackAxiosResponse: vi.fn(),
  }),
}));

describe('Users Component', () => {
  const mockUsers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      mobile: '1234567890',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      mobile: '0987654321',
    },
  ];

  beforeEach(() => {
    (getUsers as jest.Mock).mockResolvedValue({ data: { results: mockUsers } });
    (deleteUserApi.default as jest.Mock).mockResolvedValue({ success: true });
    (clearUserSessionsApi.default as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays users', async () => {
    render(<Users />);

    // Wait for the users to be rendered
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });

  it('deletes a user', async () => {
    render(<Users />);

    // Wait for users to be rendered
    await waitFor(() => expect(screen.getByText('John')).toBeInTheDocument());

    // Click on delete button for John
    const deleteButtons = screen.getAllByRole('button', {
      name: /Delete user/i,
    });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteUserApi.default).toHaveBeenCalledWith('1');
      expect(screen.queryByText('John')).not.toBeInTheDocument(); // John should be removed
      expect(screen.getByText('Jane')).toBeInTheDocument(); // Jane should still be there
    });
  });

  it('clears user sessions', async () => {
    render(<Users />);

    // Wait for users to be rendered
    await waitFor(() => expect(screen.getByText('John')).toBeInTheDocument());

    // Click on clear sessions button for John
    const clearAllSessionsButtons = screen.getAllByRole('button', {
      name: /Clear all sessions/i,
    });
    fireEvent.click(clearAllSessionsButtons[0]);

    await waitFor(() => {
      expect(clearUserSessionsApi.default).toHaveBeenCalledWith('1');
    });
  });

  it('does not allow deleting the admin user', async () => {
    const adminUser = {
      id: '3',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@admin.com',
      mobile: '1111111111',
    };
    (getUsers as jest.Mock).mockResolvedValue({
      data: { results: [adminUser] },
    });

    render(<Users />);

    // Wait for the admin user to be rendered
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Click on delete button for Admin
    fireEvent.click(
      screen.getByRole('button', { name: /Delete user/i, hidden: true }),
    );

    // Since the admin can't be deleted, check that the deleteUser function wasn't called
    expect(deleteUserApi.default).not.toHaveBeenCalled();
  });
});
