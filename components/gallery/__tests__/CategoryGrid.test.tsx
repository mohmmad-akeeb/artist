/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CategoryGrid from '../CategoryGrid';
import { Category } from '@/lib/types';

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ alt, src }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} />;
  };
});

const mockCategories: Category[] = [
  {
    id: 'A',
    name: 'Category A',
    description: 'Abstract compositions and experimental works',
    coverImage: '/test-image-a.jpg',
    artworkCount: 25,
  },
  {
    id: 'B',
    name: 'Category B',
    description: 'Landscape and nature-inspired paintings',
    coverImage: '/test-image-b.jpg',
    artworkCount: 20,
  },
  {
    id: 'C',
    name: 'Category C',
    description: 'Portrait and figure studies',
    coverImage: '/test-image-c.jpg',
    artworkCount: 15,
  },
  {
    id: 'D',
    name: 'Category D',
    description: 'Mixed media and contemporary works',
    coverImage: '/test-image-d.jpg',
    artworkCount: 30,
  },
];

describe('CategoryGrid', () => {
  it('renders all category cards', () => {
    render(<CategoryGrid categories={mockCategories} />);

    // Check that all category names are rendered
    expect(screen.getByText('Category A')).toBeInTheDocument();
    expect(screen.getByText('Category B')).toBeInTheDocument();
    expect(screen.getByText('Category C')).toBeInTheDocument();
    expect(screen.getByText('Category D')).toBeInTheDocument();
  });

  it('displays correct artwork counts', () => {
    render(<CategoryGrid categories={mockCategories} />);

    expect(screen.getByText('25 pieces')).toBeInTheDocument();
    expect(screen.getByText('20 pieces')).toBeInTheDocument();
    expect(screen.getByText('15 pieces')).toBeInTheDocument();
    expect(screen.getByText('30 pieces')).toBeInTheDocument();
  });

  it('creates correct navigation links', () => {
    render(<CategoryGrid categories={mockCategories} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/work/a');
    expect(links[1]).toHaveAttribute('href', '/work/b');
    expect(links[2]).toHaveAttribute('href', '/work/c');
    expect(links[3]).toHaveAttribute('href', '/work/d');
  });

  it('displays category descriptions', () => {
    render(<CategoryGrid categories={mockCategories} />);

    expect(
      screen.getByText('Abstract compositions and experimental works')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Landscape and nature-inspired paintings')
    ).toBeInTheDocument();
    expect(screen.getByText('Portrait and figure studies')).toBeInTheDocument();
    expect(
      screen.getByText('Mixed media and contemporary works')
    ).toBeInTheDocument();
  });

  it('handles singular artwork count correctly', () => {
    const singleArtworkCategories: Category[] = [
      {
        id: 'A',
        name: 'Category A',
        description: 'Test category',
        coverImage: '/test-image.jpg',
        artworkCount: 1,
      },
    ];

    render(<CategoryGrid categories={singleArtworkCategories} />);
    expect(screen.getByText('1 piece')).toBeInTheDocument();
  });
});
