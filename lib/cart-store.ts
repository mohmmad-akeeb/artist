/**
 * Print Cart State Management
 *
 * This module provides Zustand-based state management for the print selection cart.
 * Users can select multiple artworks and manage them for print inquiries.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Artwork, CartItem, CartState } from './types';

interface CartStore extends CartState {
  /** Check if an artwork is already in the cart */
  isInCart: (_artworkId: string) => boolean;
  /** Get the total number of items in the cart */
  getItemCount: () => number;
  /** Toggle an artwork in the cart (add if not present, remove if present) */
  toggleItem: (_artwork: Artwork) => void;
}

/**
 * Zustand store for managing print cart state
 * Persisted to localStorage to maintain cart across sessions
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (artwork: Artwork) => {
        const { items, isInCart } = get();

        // Don't add if already in cart
        if (isInCart(artwork.id)) {
          return;
        }

        const newItem: CartItem = {
          artworkId: artwork.id,
          title: artwork.title,
          category: artwork.category,
        };

        set({ items: [...items, newItem] });
      },

      removeItem: (artworkId: string) => {
        const { items } = get();
        set({ items: items.filter(item => item.artworkId !== artworkId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getFormattedList: () => {
        const { items } = get();

        if (items.length === 0) {
          return '';
        }

        const artworkIds = items.map(item => item.artworkId).join(', ');
        return `I am interested in knowing the prices of the following prints: ${artworkIds}`;
      },

      isInCart: (artworkId: string) => {
        const { items } = get();
        return items.some(item => item.artworkId === artworkId);
      },

      getItemCount: () => {
        const { items } = get();
        return items.length;
      },

      toggleItem: (artwork: Artwork) => {
        const { isInCart, addItem, removeItem } = get();

        if (isInCart(artwork.id)) {
          removeItem(artwork.id);
        } else {
          addItem(artwork);
        }
      },
    }),
    {
      name: 'artist-portfolio-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist the items array
      partialize: state => ({ items: state.items }),
    }
  )
);

/**
 * Hook to get cart statistics
 */
export const useCartStats = () => {
  const items = useCartStore(state => state.items);

  const stats = {
    totalItems: items.length,
    categoryCounts: items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    isEmpty: items.length === 0,
  };

  return stats;
};

/**
 * Hook to check if a specific artwork is in the cart
 */
export const useIsInCart = (artworkId: string) => {
  return useCartStore(state => state.isInCart(artworkId));
};

/**
 * Hook to get cart actions without subscribing to state changes
 */
export const useCartActions = () => {
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);
  const toggleItem = useCartStore(state => state.toggleItem);
  const getFormattedList = useCartStore(state => state.getFormattedList);

  return {
    addItem,
    removeItem,
    clearCart,
    toggleItem,
    getFormattedList,
  };
};
