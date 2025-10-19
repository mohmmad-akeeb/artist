/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGrid from '../ImageGrid';
import { Artwork } from '@/lib/types';

// Mock the cart store
const mockToggleItem = jest.fn();
const mockIsInCart = jest.fn();

jest.mock('@/lib/cart-store', () => ({
  useCartActions: () => ({
    toggleItem: mockToggleItem,
  }),
  useIsInCart: (id: string) => mockIsInCart(id),
}));

// Mock the modal store
const mockOpenModal = jest.fn();

jest.mock('@/lib/modal-store', () => ({
  useModalActions: () => ({
    openModal: mockOpenModal,
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
        data-testid="artwork-image"
      />
    );
  };
});

// Mock intersection observer
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

global.IntersectionObserver = jest.fn().mockImplementation(_callback => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
  root: null,
  rootMargin: '',
  thresholds: [],
}));

const mockArtworks: Artwork[] = [
  {
    id: 'A1',
    category: 'A',
    title: 'Abstract Composition 1',
    description: 'A vibrant abstract piece exploring color and form',
    imageUrl: '/images/a1.jpg',
    thumbnailUrl: '/images/a1-thumb.jpg',
    year: 2023,
    medium: 'Oil on canvas',
    dimensions: '24x36 inches',
  },
  {
    id: 'A2',
    category: 'A',
    title: 'Abstract Composition 2',
    description: 'Another exploration in abstract expressionism',
    imageUrl: '/images/a2.jpg',
    thumbnailUrl: '/images/a2-thumb.jpg',
    year: 2023,
    medium: 'Acrylic on canvas',
    dimensions: '30x40 inches',
  },
  {
    id: 'A3',
    category: 'A',
    title: 'Abstract Composition 3',
    description: 'Bold strokes and dynamic composition',
    imageUrl: '/images/a3.jpg',
    thumbnailUrl: '/images/a3-thumb.jpg',
    year: 2022,
    medium: 'Mixed media',
    dimensions: '18x24 inches',
  },
];

describe('ImageGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInCart.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders all artworks', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(screen.getAllByTestId('artwork-image')).toHaveLength(3);
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
      expect(screen.getByText('A3')).toBeInTheDocument();
    });

    it('displays artwork titles and identifiers', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(screen.getByText('Abstract Composition 1')).toBeInTheDocument();
      expect(screen.getByText('Abstract Composition 2')).toBeInTheDocument();
      expect(screen.getByText('Abstract Composition 3')).toBeInTheDocument();
    });

    it('renders empty state when no artworks', () => {
      render(<ImageGrid artworks={[]} />);

      expect(screen.getByText(/no artworks found/i)).toBeInTheDocument();
    });

    it('uses thumbnail URLs for images', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const images = screen.getAllByTestId('artwork-image');
      expect(images[0]).toHaveAttribute('src', '/images/a1-thumb.jpg');
      expect(images[1]).toHaveAttribute('src', '/images/a2-thumb.jpg');
      expect(images[2]).toHaveAttribute('src', '/images/a3-thumb.jpg');
    });

    it('has proper alt text for images', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(
        screen.getByAltText('Abstract Composition 1 - A1')
      ).toBeInTheDocument();
      expect(
        screen.getByAltText('Abstract Composition 2 - A2')
      ).toBeInTheDocument();
      expect(
        screen.getByAltText('Abstract Composition 3 - A3')
      ).toBeInTheDocument();
    });
  });

  describe('Image Selection', () => {
    it('shows selection buttons for each artwork', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(screen.getByLabelText('Add A1 to cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Add A2 to cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Add A3 to cart')).toBeInTheDocument();
    });

    it('calls toggleItem when selection button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGrid artworks={mockArtworks} />);

      const selectButton = screen.getByLabelText('Add A1 to cart');
      await user.click(selectButton);

      expect(mockToggleItem).toHaveBeenCalledWith(mockArtworks[0]);
    });

    it('shows different button text when item is in cart', () => {
      mockIsInCart.mockImplementation((id: string) => id === 'A1');

      render(<ImageGrid artworks={mockArtworks} />);

      expect(screen.getByText('Remove from Selection')).toBeInTheDocument();
      expect(screen.getAllByText('Add to Selection')).toHaveLength(2);
    });

    it('applies selected styling when item is in cart', () => {
      mockIsInCart.mockImplementation((id: string) => id === 'A1');

      render(<ImageGrid artworks={mockArtworks} />);

      const selectedCard = screen
        .getByText('A1')
        .closest('[data-testid="artwork-card"]');
      expect(selectedCard).toHaveClass('ring-2', 'ring-primary-500');
    });

    it('prevents event bubbling on selection button click', async () => {
      const user = userEvent.setup();
      const mockCardClick = jest.fn();

      render(
        <div onClick={mockCardClick}>
          <ImageGrid artworks={mockArtworks} />
        </div>
      );

      const selectButton = screen.getByLabelText('Add A1 to cart');
      await user.click(selectButton);

      expect(mockToggleItem).toHaveBeenCalled();
      expect(mockCardClick).not.toHaveBeenCalled();
    });
  });

  describe('Modal Integration', () => {
    it('opens modal when artwork image is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGrid artworks={mockArtworks} />);

      const artworkCard = screen
        .getByText('A1')
        .closest('[data-testid="artwork-card"]');
      await user.click(artworkCard!);

      expect(mockOpenModal).toHaveBeenCalledWith(mockArtworks[0]);
    });

    it('opens modal when artwork title is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGrid artworks={mockArtworks} />);

      const titleElement = screen.getByText('Abstract Composition 1');
      await user.click(titleElement);

      expect(mockOpenModal).toHaveBeenCalledWith(mockArtworks[0]);
    });

    it('supports keyboard navigation for modal opening', async () => {
      const user = userEvent.setup();
      render(<ImageGrid artworks={mockArtworks} />);

      const artworkCard = screen
        .getByText('A1')
        .closest('[data-testid="artwork-card"]');
      artworkCard!.focus();
      await user.keyboard('{Enter}');

      expect(mockOpenModal).toHaveBeenCalledWith(mockArtworks[0]);
    });

    it('opens modal with Space key', async () => {
      const user = userEvent.setup();
      render(<ImageGrid artworks={mockArtworks} />);

      const artworkCard = screen
        .getByText('A1')
        .closest('[data-testid="artwork-card"]');
      artworkCard!.focus();
      await user.keyboard(' ');

      expect(mockOpenModal).toHaveBeenCalledWith(mockArtworks[0]);
    });
  });

  describe('Lazy Loading', () => {
    it('sets up intersection observer for lazy loading', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(IntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });

    it('observes all artwork images', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      // Should observe each artwork image
      expect(mockObserve).toHaveBeenCalledTimes(3);
    });

    it('cleans up intersection observer on unmount', () => {
      const { unmount } = render(<ImageGrid artworks={mockArtworks} />);

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Image Loading States', () => {
    it('shows loading placeholder initially', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      // Should show skeleton loaders or loading states
      const images = screen.getAllByTestId('artwork-image');
      images.forEach(img => {
        expect(img.closest('.group')).toBeInTheDocument();
      });
    });

    it('handles image load success', async () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const images = screen.getAllByTestId('artwork-image');
      fireEvent.load(images[0]);

      // Image should be visible after loading
      await waitFor(() => {
        expect(images[0]).toBeVisible();
      });
    });

    it('handles image load errors', async () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const images = screen.getAllByTestId('artwork-image');
      fireEvent.error(images[0]);

      // Should show error state or fallback
      await waitFor(() => {
        expect(screen.getByText(/image unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('applies responsive grid classes', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4'
      );
    });

    it('maintains aspect ratio for images', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const images = screen.getAllByTestId('artwork-image');
      images.forEach(img => {
        const container = img.closest('.aspect-square');
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(screen.getByRole('grid')).toHaveAttribute(
        'aria-label',
        'Artwork gallery'
      );
    });

    it('has focusable artwork cards', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const artworkCards = screen.getAllByRole('button');
      artworkCards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });

    it('provides descriptive button labels', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      expect(screen.getByLabelText('Add A1 to cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Add A2 to cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Add A3 to cart')).toBeInTheDocument();
    });

    it('supports screen reader navigation', () => {
      render(<ImageGrid artworks={mockArtworks} />);

      const artworkCards = screen.getAllByRole('button');
      artworkCards.forEach((card, index) => {
        expect(card).toHaveAttribute(
          'aria-label',
          expect.stringContaining(mockArtworks[index].title)
        );
      });
    });
  });

  describe('Performance', () => {
    it('handles large numbers of artworks efficiently', () => {
      const manyArtworks = Array.from({ length: 100 }, (_, i) => ({
        ...mockArtworks[0],
        id: `A${i + 1}`,
        title: `Artwork ${i + 1}`,
      }));

      const { container } = render(<ImageGrid artworks={manyArtworks} />);

      // Should render without performance issues
      expect(
        container.querySelectorAll('[data-testid="artwork-card"]')
      ).toHaveLength(100);
    });

    it('uses efficient re-rendering with React keys', () => {
      const { rerender } = render(<ImageGrid artworks={mockArtworks} />);

      const updatedArtworks = [
        ...mockArtworks,
        {
          ...mockArtworks[0],
          id: 'A4',
          title: 'New Artwork',
        },
      ];

      rerender(<ImageGrid artworks={updatedArtworks} />);

      // Should efficiently update without re-rendering existing items
      expect(screen.getByText('New Artwork')).toBeInTheDocument();
      expect(screen.getAllByTestId('artwork-image')).toHaveLength(4);
    });
  });
});
