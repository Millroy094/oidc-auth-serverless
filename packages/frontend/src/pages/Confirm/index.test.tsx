import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Confirm from './index';
import { vi, expect } from 'vitest';

vi.mock('../../api/oidc/authorize-interaction');
vi.mock('../../hooks/useFeedback', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    feedbackAxiosError: vi.fn(),
  })),
}));

describe('Confirm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter initialEntries={['/confirm/123']}>
        <Confirm />
      </MemoryRouter>,
    );

    expect(screen.getByText('Authorize')).toBeInTheDocument();
    expect(
      screen.getByText('Can you confirm you want to authorize this request?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });
});
