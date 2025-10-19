'use client';

import { Category } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { CategoryCoverImage } from '@/components/ui/NextOptimizedImage';
import { generateBlurDataURL } from '@/lib/image-utils';

interface CategoryGridProps {
  categories: Category[];
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const [, setImageLoaded] = useState(false);
  const [, setImageError] = useState(false);

  return (
    <Link
      href={`/work/${category.id.toLowerCase()}/`}
      className="group relative overflow-hidden rounded-lg bg-primary-50 aspect-square block transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <CategoryCoverImage
          category={category.id}
          size="medium"
          alt={`${category.name} - ${category.description}`}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
          containerClassName="w-full h-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority
          blurDataURL={generateBlurDataURL(800, 800)}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          quality={90}
          responsive={true}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
        <div className="text-white transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
          <h3 className="text-xl sm:text-2xl font-light mb-2 group-hover:text-white/90">
            {category.name}
          </h3>
          <p className="text-xs sm:text-sm text-white/80 mb-3 line-clamp-2 group-hover:text-white/70">
            {category.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 font-medium">
              {category.artworkCount}{' '}
              {category.artworkCount === 1 ? 'piece' : 'pieces'}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 border border-white/50 rounded-full flex items-center justify-center group-hover:border-white/70 transition-colors touch-target">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-white/70 group-hover:text-white/90 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-lg transition-colors duration-300" />
    </Link>
  );
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="w-full">
      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-primary-600 text-sm">
          Click on any category to explore the collection
        </p>
      </div>
    </div>
  );
}
