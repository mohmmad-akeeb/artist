# Contact Form Component

This directory contains the ContactForm component with Web3forms integration for serverless form processing.

## Setup

1. **Get Web3forms Access Key**
   - Visit [Web3forms.com](https://web3forms.com/)
   - Sign up for a free account
   - Create a new form and get your access key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Web3forms access key:
     ```
     NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_actual_access_key_here
     ```

3. **Features**
   - Form validation with real-time error feedback
   - Integration with cart system for print inquiries
   - Success/error state management
   - Accessibility compliant with ARIA attributes
   - Responsive design

## Usage

```tsx
import ContactForm from '@/components/forms/ContactForm';

// Basic usage
<ContactForm />

// With pre-filled message and callbacks
<ContactForm
  initialMessage="I am interested in prints A1, B2, C3"
  onSubmitSuccess={() => console.log('Form submitted successfully')}
  onSubmitError={(error) => console.error('Form error:', error)}
/>
```

## Testing

The component includes comprehensive tests covering:

- Form validation
- Web3forms API integration
- Error handling
- User interactions
- Accessibility features

Run tests with your preferred test runner (Jest + React Testing Library).
