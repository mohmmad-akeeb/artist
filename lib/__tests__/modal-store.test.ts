/**
 * Modal Store Tests
 *
 * Tests for the Zustand-based modal state management
 */

import { renderHook, act } from '@testing-library/react';
import { useModalStore, useModalState, useModalActions } from '../modal-store';
import { Artwork } from '../types';

// Mock artwork for testing
const mockArtwork: Artwork = {
  id: 'A1',
  category: 'A',
  title: 'Test Artwork',
  description: 'A test artwork for modal functionality',
  imageUrl: '/test-image.jpg',
  thumbnailUrl: '/test-thumbnail.jpg',
};

describe('Modal Store', () => {
  beforeEach(() => {
    // Reset modal state before each test
    useModalStore.getState().closeModal();
  });

  describe('useModalStore', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useModalStore());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.artwork).toBeUndefined();
    });

    it('opens modal with artwork', () => {
      const { result } = renderHook(() => useModalStore());

      act(() => {
        result.current.openModal(mockArtwork);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.artwork).toEqual(mockArtwork);
    });

    it('closes modal and clears artwork', () => {
      const { result } = renderHook(() => useModalStore());

      // First open the modal
      act(() => {
        result.current.openModal(mockArtwork);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.artwork).toEqual(mockArtwork);

      // Then close it
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.artwork).toBeUndefined();
    });
  });

  describe('useModalState', () => {
    it('returns current modal state', () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.artwork).toBeUndefined();
    });

    it('updates when modal state changes', () => {
      const { result: storeResult } = renderHook(() => useModalStore());
      const { result: stateResult } = renderHook(() => useModalState());

      act(() => {
        storeResult.current.openModal(mockArtwork);
      });

      expect(stateResult.current.isOpen).toBe(true);
      expect(stateResult.current.artwork).toEqual(mockArtwork);
    });
  });

  describe('useModalActions', () => {
    it('provides modal actions', () => {
      const { result } = renderHook(() => useModalActions());

      expect(typeof result.current.openModal).toBe('function');
      expect(typeof result.current.closeModal).toBe('function');
    });

    it('openModal action works correctly', () => {
      const { result: actionsResult } = renderHook(() => useModalActions());
      const { result: stateResult } = renderHook(() => useModalState());

      act(() => {
        actionsResult.current.openModal(mockArtwork);
      });

      expect(stateResult.current.isOpen).toBe(true);
      expect(stateResult.current.artwork).toEqual(mockArtwork);
    });

    it('closeModal action works correctly', () => {
      const { result: actionsResult } = renderHook(() => useModalActions());
      const { result: stateResult } = renderHook(() => useModalState());

      // First open the modal
      act(() => {
        actionsResult.current.openModal(mockArtwork);
      });

      expect(stateResult.current.isOpen).toBe(true);

      // Then close it
      act(() => {
        actionsResult.current.closeModal();
      });

      expect(stateResult.current.isOpen).toBe(false);
      expect(stateResult.current.artwork).toBeUndefined();
    });
  });

  describe('Modal workflow', () => {
    it('handles multiple artwork switches correctly', () => {
      const { result } = renderHook(() => useModalStore());

      const artwork2: Artwork = {
        ...mockArtwork,
        id: 'B2',
        category: 'B',
        title: 'Second Artwork',
      };

      // Open with first artwork
      act(() => {
        result.current.openModal(mockArtwork);
      });

      expect(result.current.artwork?.id).toBe('A1');

      // Switch to second artwork
      act(() => {
        result.current.openModal(artwork2);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.artwork?.id).toBe('B2');
      expect(result.current.artwork?.title).toBe('Second Artwork');
    });

    it('maintains modal open state when switching artworks', () => {
      const { result } = renderHook(() => useModalStore());

      const artwork2: Artwork = {
        ...mockArtwork,
        id: 'B2',
        category: 'B',
      };

      // Open with first artwork
      act(() => {
        result.current.openModal(mockArtwork);
      });

      expect(result.current.isOpen).toBe(true);

      // Switch to second artwork - should remain open
      act(() => {
        result.current.openModal(artwork2);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.artwork?.id).toBe('B2');
    });
  });
});
