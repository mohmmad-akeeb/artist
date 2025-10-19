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
    const { addItem, items, getItemCount, isInCart } = useCartStore.getState();

    addItem(mockArtwork);

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
    const { addItem, items, getItemCount } = useCartStore.getState();

    addItem(mockArtwork);
    addItem(mockArtwork); // Try to add same item again

    expect(items).toHaveLength(1);
    expect(getItemCount()).toBe(1);
  });

  it('should remove item from cart', () => {
    const { addItem, removeItem, items, getItemCount, isInCart } =
      useCartStore.getState();

    addItem(mockArtwork);
    expect(getItemCount()).toBe(1);

    removeItem('A1');

    expect(items).toHaveLength(0);
    expect(getItemCount()).toBe(0);
    expect(isInCart('A1')).toBe(false);
  });

  it('should toggle items correctly', () => {
    const { toggleItem, isInCart, getItemCount } = useCartStore.getState();

    // Add item
    toggleItem(mockArtwork);
    expect(isInCart('A1')).toBe(true);
    expect(getItemCount()).toBe(1);

    // Remove item
    toggleItem(mockArtwork);
    expect(isInCart('A1')).toBe(false);
    expect(getItemCount()).toBe(0);
  });

  it('should clear all items', () => {
    const { addItem, clearCart, items, getItemCount } = useCartStore.getState();

    addItem(mockArtwork);
    addItem(mockArtwork2);
    expect(getItemCount()).toBe(2);

    clearCart();

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
