'use client';

import ImageModal from './ImageModal';
import { useModalState, useModalActions } from '@/lib/modal-store';

/**
 * ImageModalProvider Component
 *
 * This component provides the global image modal functionality by connecting
 * the ImageModal component to the modal store. It should be placed at the
 * root level of the application to ensure the modal can be displayed from
 * any component.
 */
export default function ImageModalProvider() {
  const { isOpen, artwork } = useModalState();
  const { closeModal } = useModalActions();

  return (
    <ImageModal
      isOpen={isOpen}
      artwork={artwork || null}
      onClose={closeModal}
    />
  );
}
