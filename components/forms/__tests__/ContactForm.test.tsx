/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';
import { vi, Mock } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock environment variable
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY: 'test-key',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('ContactForm', () => {
  const mockOnSubmitSuccess = vi.fn();
  const mockOnSubmitError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as Mock).mockClear();
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send message/i })
      ).toBeInTheDocument();
    });

    it('renders with initial message', () => {
      const initialMessage = 'I am interested in artwork A1, B2';
      render(<ContactForm initialMessage={initialMessage} />);

      const messageField = screen.getByLabelText(/message/i);
      expect(messageField).toHaveValue(initialMessage);
    });

    it('updates message when initialMessage prop changes', () => {
      const { rerender } = render(
        <ContactForm initialMessage="Initial message" />
      );

      const messageField = screen.getByLabelText(/message/i);
      expect(messageField).toHaveValue('Initial message');

      rerender(<ContactForm initialMessage="Updated message" />);
      expect(messageField).toHaveValue('Updated message');
    });

    it('has proper accessibility attributes', () => {
      render(<ContactForm />);

      const firstNameField = screen.getByLabelText(/first name/i);
      const emailField = screen.getByLabelText(/email/i);
      const messageField = screen.getByLabelText(/message/i);

      expect(firstNameField).toHaveAttribute('aria-invalid', 'false');
      expect(emailField).toHaveAttribute('aria-invalid', 'false');
      expect(messageField).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });

    it('validates first name length', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const firstNameField = screen.getByLabelText(/first name/i);
      await user.type(firstNameField, 'A');

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      expect(
        screen.getByText('First name must be at least 2 characters')
      ).toBeInTheDocument();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailField = screen.getByLabelText(/email/i);
      await user.type(emailField, 'invalid-email');

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.submit(submitButton.closest('form')!);

      expect(
        await screen.findByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });

    it('validates message length', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageField = screen.getByLabelText(/message/i);
      await user.type(messageField, 'Short');

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      expect(
        screen.getByText('Message must be at least 10 characters')
      ).toBeInTheDocument();
    });

    it('accepts valid email formats', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailField = screen.getByLabelText(/email/i);

      // Test various valid email formats
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      for (const email of validEmails) {
        await user.clear(emailField);
        await user.type(emailField, email);

        const submitButton = screen.getByRole('button', {
          name: /send message/i,
        });
        await user.click(submitButton);

        // Should not show email validation error
        expect(
          screen.queryByText('Please enter a valid email address')
        ).not.toBeInTheDocument();
      }
    });

    it('clears field errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Trigger validation errors
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      expect(screen.getByText('First name is required')).toBeInTheDocument();

      // Start typing in first name field
      const firstNameField = screen.getByLabelText(/first name/i);
      await user.type(firstNameField, 'J');

      // Error should be cleared
      expect(
        screen.queryByText('First name is required')
      ).not.toBeInTheDocument();
    });

    it('updates aria-invalid when validation fails', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const firstNameField = screen.getByLabelText(/first name/i);
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });

      await user.click(submitButton);

      expect(firstNameField).toHaveAttribute('aria-invalid', 'true');
      expect(firstNameField).toHaveAttribute(
        'aria-describedby',
        'firstName-error'
      );
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      firstName: 'John',
      email: 'john@example.com',
      message: 'This is a test message with enough characters.',
    };

    it('submits form with valid data', async () => {
      const user = userEvent.setup();

      // Mock successful health check and submission
      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<ContactForm onSubmitSuccess={mockOnSubmitSuccess} />);

      // Fill out form
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.firstName
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/message/i), validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Wait for submission
      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalled();
      });

      // Check success message
      expect(
        screen.getByText('Thank you for your message!')
      ).toBeInTheDocument();
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();

      // Mock delayed response
      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true }),
                  }),
                100
              )
            )
        );

      render(<ContactForm />);

      // Fill out form
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.firstName
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/message/i), validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles network errors', async () => {
      const user = userEvent.setup();

      // Mock network error
      (fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(<ContactForm onSubmitError={mockOnSubmitError} />);

      // Fill out form
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.firstName
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/message/i), validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Wait for error handling
      await waitFor(() => {
        expect(mockOnSubmitError).toHaveBeenCalled();
      });

      expect(
        screen.getByText('There was an error sending your message')
      ).toBeInTheDocument();
    });

    it('handles service unavailable error', async () => {
      const user = userEvent.setup();

      // Mock service unavailable (health check fails)
      (fetch as Mock).mockRejectedValue(new Error('Service unavailable'));

      render(<ContactForm />);

      // Fill out form
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.firstName
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/message/i), validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Wait for error
      await waitFor(() => {
        expect(
          screen.getByText(/temporarily unavailable/i)
        ).toBeInTheDocument();
      });
    });

    it('retries failed submissions', async () => {
      const user = userEvent.setup();

      // Mock health check success, then fail twice, then succeed
      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<ContactForm onSubmitSuccess={mockOnSubmitSuccess} />);

      // Fill out form
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.firstName
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/message/i), validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Wait for eventual success after retries
      await waitFor(
        () => {
          expect(mockOnSubmitSuccess).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });

    it('clears form after successful submission', async () => {
      const user = userEvent.setup();

      // Mock successful submission
      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<ContactForm />);

      // Fill out form
      const firstNameField = screen.getByLabelText(/first name/i);
      const emailField = screen.getByLabelText(/email/i);
      const messageField = screen.getByLabelText(/message/i);

      await user.type(firstNameField, validFormData.firstName);
      await user.type(emailField, validFormData.email);
      await user.type(messageField, validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Wait for success and form clearing
      await waitFor(() => {
        expect(firstNameField).toHaveValue('');
        expect(emailField).toHaveValue('');
        expect(messageField).toHaveValue('');
      });
    });

    it('sends correct data to Web3forms', async () => {
      const user = userEvent.setup();

      // Mock successful submission
      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<ContactForm />);

      // Fill out form
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.firstName
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(screen.getByLabelText(/message/i), validFormData.message);

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      // Wait for submission
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://api.web3forms.com/submit',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              access_key: 'test-key',
              name: validFormData.firstName,
              email: validFormData.email,
              message: validFormData.message,
              subject: 'New Contact Form Submission - Artist Portfolio',
              from_name: 'Artist Portfolio Website',
            }),
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('associates error messages with fields', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      await user.click(submitButton);

      const firstNameField = screen.getByLabelText(/first name/i);
      const errorMessage = screen.getByText('First name is required');

      expect(firstNameField).toHaveAttribute(
        'aria-describedby',
        'firstName-error'
      );
      expect(errorMessage).toHaveAttribute('id', 'firstName-error');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/first name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/message/i)).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: /send message/i })
      ).toHaveFocus();
    });
  });
});
