/**
 * Cart Store Tests
 *
 * Tests for the Zustand-based cart state management
 */

import { useCartStore } from '../cart-store';
import { Artwork } from '../types';

// Mock artwork for testing
const mockArtwork: Artwork = {
  id: 'A1',
  category: 'A',
  title: 'Test Artwork',
  description: 'A test artwork for cart functionality',
  imageUrl: '/test-image.jpg',
  thumbnailUrl: '/test-thumbnail.jpg',
};

const mockArtwork2: Artwork = {
  id: 'B2',
  category: 'B',
  title: 'Another Test Artwork',
  description: 'Another test artwork',
  imageUrl: '/test-image-2.jpg',
  thumbnailUrl: '/test-thumbnail-2.jpg',
};

describe('Cart Store', () => {
  beforeEach(() => {
    // Clear cart before each test
    useCartStore.getState().clearCart();
  });

  it('should start with empty cart', () => {
    const { items, getItemCount } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(getItemCount()).toBe(0);
  });

  it('should add item to cart', () => {
    useCartStore.getState().addItem(mockArtwork);

    const { items, getItemCount, isInCart } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(getItemCount()).toBe(1);
    expect(isInCart('A1')).toBe(true);
    expect(items[0]).toEqual({
      artworkId: 'A1',
      title: 'Test Artwork',
      category: 'A',
    });
  });

  it('should not add duplicate items', () => {
    useCartStore.getState().addItem(mockArtwork);
    useCartStore.getState().addItem(mockArtwork); // Try to add same item again

    const { items, getItemCount } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(getItemCount()).toBe(1);
  });

  it('should remove item from cart', () => {
    useCartStore.getState().addItem(mockArtwork);
    expect(useCartStore.getState().getItemCount()).toBe(1);

    useCartStore.getState().removeItem('A1');

    const { items, getItemCount, isInCart } = useCartStore.getState();

    expect(items).toHaveLength(0);
    expect(getItemCount()).toBe(0);
    expect(isInCart('A1')).toBe(false);
  });

  it('should toggle items correctly', () => {
    // Add item
    useCartStore.getState().toggleItem(mockArtwork);
    expect(useCartStore.getState().isInCart('A1')).toBe(true);
    expect(useCartStore.getState().getItemCount()).toBe(1);

    // Remove item
    useCartStore.getState().toggleItem(mockArtwork);
    expect(useCartStore.getState().isInCart('A1')).toBe(false);
    expect(useCartStore.getState().getItemCount()).toBe(0);
  });

  it('should clear all items', () => {
    useCartStore.getState().addItem(mockArtwork);
    useCartStore.getState().addItem(mockArtwork2);
    expect(useCartStore.getState().getItemCount()).toBe(2);

    useCartStore.getState().clearCart();

    const { items, getItemCount } = useCartStore.getState();

    expect(items).toHaveLength(0);
    expect(getItemCount()).toBe(0);
  });

  it('should generate formatted list for contact form', () => {
    const { addItem, getFormattedList } = useCartStore.getState();

    // Empty cart
    expect(getFormattedList()).toBe('');

    // Single item
    addItem(mockArtwork);
    expect(getFormattedList()).toBe(
      'I am interested in knowing the prices of the following prints: A1'
    );

    // Multiple items
    addItem(mockArtwork2);
    expect(getFormattedList()).toBe(
      'I am interested in knowing the prices of the following prints: A1, B2'
    );
  });
});
