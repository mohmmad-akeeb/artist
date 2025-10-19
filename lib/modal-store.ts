/**
 * Modal State Management
 *
 * This module provides a simple state management solution for the image modal
 * using React hooks and context. It manages the modal open/close state and
 * the currently displayed artwork.
 */

import { create } from 'zustand';
import { Artwork, ModalState } from './types';

interface ModalStore extends ModalState {
  /** Open the modal with a specific artwork */
  openModal: (_artwork: Artwork) => void;
  /** Close the modal */
  closeModal: () => void;
}

/**
 * Zustand store for modal state management
 */
export const useModalStore = create<ModalStore>(set => ({
  isOpen: false,
  artwork: undefined,

  openModal: (artwork: Artwork) => {
    set({ isOpen: true, artwork });
  },

  closeModal: () => {
    set({ isOpen: false, artwork: undefined });
  },
}));

/**
 * Hook to get modal state
 */
export const useModalState = () => {
  const { isOpen, artwork } = useModalStore();
  return { isOpen, artwork };
};

/**
 * Hook to get modal actions
 */
export const useModalActions = () => {
  const { openModal, closeModal } = useModalStore();
  return { openModal, closeModal };
};
