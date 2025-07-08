import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { FormField } from '../form-field';

describe('FormField', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and input correctly', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('displays error message when provided', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text when provided and no error', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        helperText="This is a helper text"
      />
    );

    expect(screen.getByText('This is a helper text')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        error="This field is required"
        helperText="This is a helper text"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByText('This is a helper text')).not.toBeInTheDocument();
  });

  it('renders different input types', () => {
    const { rerender } = render(
      <FormField
        label="Password"
        name="password"
        value=""
        onChange={mockOnChange}
        type="password"
      />
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');

    rerender(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        type="email"
      />
    );

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('shows placeholder text', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        placeholder="Enter your text here"
      />
    );

    expect(screen.getByPlaceholderText('Enter your text here')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        disabled
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const container = screen.getByRole('textbox').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('handles numeric values', () => {
    render(
      <FormField
        label="Age"
        name="age"
        value={25}
        onChange={mockOnChange}
        type="number"
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(25);

    fireEvent.change(input, { target: { value: '30' } });
    expect(mockOnChange).toHaveBeenCalledWith('30');
  });

  it('applies error styling to input', () => {
    render(
      <FormField
        label="Test Label"
        name="test-field"
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });
});