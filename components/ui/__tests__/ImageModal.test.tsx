/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageModal from '../ImageModal';
import { Artwork } from '@/lib/types';
import { vi } from 'vitest';

// Mock the cart store
vi.mock('@/lib/cart-store', () => ({
  useIsInCart: vi.fn(() => false),
  useCartActions: vi.fn(() => ({
    toggleItem: vi.fn(),
  })),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img src={src} alt={alt} onLoad={onLoad} onError={onError} {...props} />
    );
  },
}));

const mockArtwork: Artwork = {
  id: 'A1',
  category: 'A',
  title: 'Test Artwork',
  description: 'A beautiful test artwork for modal display',
  imageUrl: '/test-image.jpg',
  thumbnailUrl: '/test-thumbnail.jpg',
  year: 2023,
  medium: 'Oil on canvas',
  dimensions: '24x36 inches',
};

describe('ImageModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders nothing when not open', () => {
    render(
      <ImageModal isOpen={false} artwork={mockArtwork} onClose={mockOnClose} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when no artwork provided', () => {
    render(<ImageModal isOpen={true} artwork={null} onClose={mockOnClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when open with artwork', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Artwork')).toBeInTheDocument();
    expect(
      screen.getByText('A beautiful test artwork for modal display')
    ).toBeInTheDocument();
    expect(screen.getAllByText('A1').length).toBeGreaterThan(0);
  });

  it('displays artwork details correctly', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    expect(screen.getAllByText('2023').length).toBeGreaterThan(0);
    expect(screen.getByText('Oil on canvas')).toBeInTheDocument();
    expect(screen.getByText('24x36 inches')).toBeInTheDocument();
    expect(screen.getByText('Category A')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    const modalContent = screen.getByText('Test Artwork');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays cart selection button', () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    expect(screen.getByLabelText('Add A1 to cart')).toBeInTheDocument();
    expect(screen.getByText('Select for Print Query')).toBeInTheDocument();
  });

  it('shows error state when image fails to load', async () => {
    render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    const image = screen.getByAltText('Test Artwork - A1');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByText('Image unavailable')).toBeInTheDocument();
    });
  });

  it('prevents body scroll when modal is open', () => {
    const { rerender } = render(
      <ImageModal isOpen={true} artwork={mockArtwork} onClose={mockOnClose} />
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ImageModal isOpen={false} artwork={mockArtwork} onClose={mockOnClose} />
    );

    expect(document.body.style.overflow).toBe('unset');
  });
});
