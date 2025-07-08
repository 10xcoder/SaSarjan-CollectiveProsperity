import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { UserModal } from '../user-modal';
import { mockUser } from '@/test/utils';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('UserModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('renders create user modal when no user is provided', () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByText('Add a new user to the platform.')).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders edit user modal when user is provided', () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        user={mockUser}
      />
    );

    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByText('Update user details below.')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.full_name)).toBeInTheDocument();
  });

  it('does not show password field when editing existing user', () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        user={mockUser}
      />
    );

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it('shows password field when creating new user', () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('handles form submission for new user creation', async () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'New User' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create User'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password123',
          full_name: 'New User',
          location: '',
          age_group: '',
          profession: '',
          bio: '',
          wallet_balance: '0',
        }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'User created',
      description: 'New user has been created successfully.',
    });
  });

  it('handles form submission for user update', async () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        user={mockUser}
      />
    );

    // Change a field
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Updated Name' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Update User'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'User updated',
      description: 'User details have been updated successfully.',
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Something went wrong' }),
    });

    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create User'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    });
  });

  it('validates required fields', async () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Submit without filling required fields
    fireEvent.click(screen.getByText('Create User'));

    // Should show validation (HTML5 validation will prevent submission)
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const fullNameInput = screen.getByLabelText(/full name/i);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(fullNameInput).toHaveAttribute('required');
  });

  it('closes modal when cancelled', () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables email field when editing existing user', () => {
    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        user={mockUser}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    // Mock a delayed response
    (fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <UserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create User'));

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});