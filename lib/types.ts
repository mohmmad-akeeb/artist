// Core data models for the artist portfolio website

/**
 * Artwork interface representing individual paintings
 * Used for displaying artwork in galleries and managing print selections
 */
export interface Artwork {
  /** Unique identifier in format A1, A2, B1, B2, etc. */
  id: string;
  /** Category classification (A, B, C, or D) */
  category: 'A' | 'B' | 'C' | 'D';
  /** Display title of the artwork */
  title: string;
  /** Detailed description of the artwork */
  description: string;
  /** Full resolution image URL from Cloudflare R2 */
  imageUrl: string;
  /** Optimized thumbnail URL for gallery views */
  thumbnailUrl: string;
  /** Optional artwork dimensions */
  dimensions?: string;
  /** Year the artwork was created */
  year?: number;
  /** Medium used (oil, acrylic, etc.) */
  medium?: string;
}

/**
 * Category interface for organizing artwork collections
 * Used for the main work page category grid
 */
export interface Category {
  /** Category identifier (A, B, C, or D) */
  id: 'A' | 'B' | 'C' | 'D';
  /** Display name for the category */
  name: string;
  /** Description of the category theme or style */
  description: string;
  /** Cover image URL for category card display */
  coverImage: string;
  /** Total number of artworks in this category */
  artworkCount: number;
}

/**
 * Cart item interface for print selection functionality
 * Represents a selected artwork for print inquiry
 */
export interface CartItem {
  /** Reference to the artwork ID */
  artworkId: string;
  /** Artwork title for display in cart */
  title: string;
  /** Category for organization */
  category: string;
}

/**
 * Cart state interface for managing print selections
 * Provides methods for cart management and form integration
 */
export interface CartState {
  /** Array of selected cart items */
  items: CartItem[];
  /** Add an artwork to the cart */
  addItem: (_artwork: Artwork) => void;
  /** Remove an item from the cart by artwork ID */
  removeItem: (_artworkId: string) => void;
  /** Clear all items from the cart */
  clearCart: () => void;
  /** Get formatted list of selected items for contact form */
  getFormattedList: () => string;
}

/**
 * Contact form data interface
 * Used for form validation and submission
 */
export interface ContactFormData {
  /** User's first name */
  firstName: string;
  /** User's email address */
  email: string;
  /** Message content */
  message: string;
}

/**
 * Form validation error interface
 * Used for displaying field-specific errors
 */
export interface FormErrors {
  firstName?: string;
  email?: string;
  message?: string;
}

/**
 * API response interface for form submissions
 * Used for handling Web3forms responses
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if request failed */
  error?: string;
  /** Additional error details */
  details?: string;
}

/**
 * Image loading state interface
 * Used for managing image loading states in gallery components
 */
export interface ImageLoadState {
  /** Whether the image is currently loading */
  loading: boolean;
  /** Whether the image loaded successfully */
  loaded: boolean;
  /** Error message if image failed to load */
  error?: string;
}

/**
 * Modal state interface
 * Used for managing image modal display
 */
export interface ModalState {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Currently displayed artwork */
  artwork?: Artwork;
}

// Utility types for enhanced type safety

/**
 * Category ID type for type-safe category handling
 */
export type CategoryId = 'A' | 'B' | 'C' | 'D';

/**
 * Artwork ID pattern type
 * Ensures IDs follow the correct format (letter + number)
 */
export type ArtworkIdPattern = `${CategoryId}${number}`;

/**
 * Form field names for type-safe form handling
 */
export type ContactFormField = keyof ContactFormData;

/**
 * Image size variants for responsive image handling
 */
export type ImageSize = 'thumbnail' | 'medium' | 'full';

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
