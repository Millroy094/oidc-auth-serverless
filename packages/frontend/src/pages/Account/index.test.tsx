import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, expect } from 'vitest';
import Account from './index';
import { useAuth } from '../../context/AuthProvider';

vi.mock('../../context/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('Account Component', () => {
  const mockLogout = vi.fn();
  const mockUseAuth = {
    user: {
      roles: ['admin'],
    },
    logout: mockLogout,
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue(mockUseAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    expect(screen.getByText('INNOVO')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Log out/i }),
    ).toBeInTheDocument();
  });

  it('renders Profile tab by default', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders Security tab when clicked', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Security'));
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('calls logout function when Log out button is clicked', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Log out/i }));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders Clients and Users tabs for admin users', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );

    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});
