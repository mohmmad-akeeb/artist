'use client';

import React, { useState } from 'react';

interface ContactFormProps {
  initialMessage?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (_error: string) => void;
}

interface FormData {
  firstName: string;
  email: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  email?: string;
  message?: string;
  general?: string;
}

export default function ContactForm({
  initialMessage = '',
  onSubmitSuccess,
  onSubmitError,
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    email: '',
    message: initialMessage,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  // Update message when initialMessage prop changes
  React.useEffect(() => {
    if (initialMessage && initialMessage !== formData.message) {
      setFormData(prev => ({
        ...prev,
        message: initialMessage,
      }));
    }
  }, [initialMessage, formData.message]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrors({});

    try {
      // Check if Web3forms access key is configured
      if (!process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || 
          process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY === 'your_web3forms_access_key_here') {
        throw new Error(
          'Contact form is not configured yet. Please email me directly at artist@example.com'
        );
      }

      // Check if Web3forms is available
      const healthCheck = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ access_key: 'test' }),
      }).catch(() => null);

      if (!healthCheck) {
        throw new Error(
          'Contact service is temporarily unavailable. Please try again later or email me directly.'
        );
      }

      // Web3forms integration with retry logic
      const submitForm = async () => {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
            name: formData.firstName,
            email: formData.email,
            message: formData.message,
            subject: 'New Contact Form Submission - Artist Portfolio',
            from_name: 'Artist Portfolio Website',
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Network error: ${response.status} ${response.statusText}`
          );
        }

        return response;
      };

      // Retry logic
      let lastError: Error | null = null;
      let success = false;

      for (let attempt = 0; attempt < 3 && !success; attempt++) {
        try {
          const response = await submitForm();
          const result = await response.json();

          if (result.success) {
            success = true;
            setSubmitStatus('success');
            setFormData({ firstName: '', email: '', message: '' });
            onSubmitSuccess?.();
          } else {
            throw new Error(result.message || 'Form submission failed');
          }
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error('Unknown error');

          // Wait before retry (exponential backoff)
          if (attempt < 2) {
            await new Promise(resolve =>
              setTimeout(resolve, 1000 * (attempt + 1))
            );
          }
        }
      }

      if (!success && lastError) {
        throw lastError;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof Error) {
        if (
          error.message.includes('Network error') ||
          error.message.includes('fetch')
        ) {
          errorMessage =
            'Network connection error. Please check your internet connection and try again.';
        } else if (error.message.includes('temporarily unavailable')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }

      setSubmitStatus('error');
      setErrors({ general: errorMessage });
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div
          className="animate-slide-in-left"
          style={{ animationDelay: '0.1s' }}
        >
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-primary-900 mb-2 transition-colors duration-200"
          >
            First Name *
          </label>
          <div className="relative group">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 touch-target group-hover:border-primary-400 ${
                errors.firstName
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 animate-shake'
                  : 'border-primary-300'
              }`}
              placeholder="Your first name"
              aria-invalid={errors.firstName ? 'true' : 'false'}
              aria-describedby={
                errors.firstName ? 'firstName-error' : undefined
              }
            />
            {/* Focus indicator */}
            <div className="absolute inset-0 rounded-lg bg-primary-50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
          {errors.firstName && (
            <p
              id="firstName-error"
              className="mt-1 text-sm text-red-600 animate-slide-down"
            >
              {errors.firstName}
            </p>
          )}
        </div>

        <div
          className="animate-slide-in-right"
          style={{ animationDelay: '0.2s' }}
        >
          <label
            htmlFor="email"
            className="block text-sm font-medium text-primary-900 mb-2 transition-colors duration-200"
          >
            Email *
          </label>
          <div className="relative group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 touch-target group-hover:border-primary-400 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 animate-shake'
                  : 'border-primary-300'
              }`}
              placeholder="your.email@example.com"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {/* Focus indicator */}
            <div className="absolute inset-0 rounded-lg bg-primary-50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600 animate-slide-down"
            >
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-primary-900 mb-2 transition-colors duration-200"
        >
          Message *
        </label>
        <div className="relative group">
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-3 sm:px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 resize-vertical touch-target group-hover:border-primary-400 ${
              errors.message
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 animate-shake'
                : 'border-primary-300'
            }`}
            placeholder="Tell me about your inquiry..."
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {/* Focus indicator */}
          <div className="absolute inset-0 rounded-lg bg-primary-50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>
        {errors.message && (
          <p
            id="message-error"
            className="mt-1 text-sm text-red-600 animate-slide-down"
          >
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Status Messages */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-scale-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400 animate-bounce-gentle"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Thank you for your message!
              </p>
              <p className="mt-1 text-sm text-green-700">
                I&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-scale-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400 animate-pulse"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                There was an error sending your message
              </p>
              <p className="mt-1 text-sm text-red-700">
                {errors.general || 'Please try again or contact me directly.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-target text-base font-medium hover:scale-105 active:scale-95 hover:shadow-lg group relative overflow-hidden"
        >
          {/* Button background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-800 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Button content */}
          <span className="relative z-10">
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                Send Message
                <svg
                  className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </span>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
