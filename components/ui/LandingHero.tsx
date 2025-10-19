'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { preloadLandingImages } from '@/components/ui/CriticalImagePreloader';
import { generateBlurDataURL } from '@/lib/image-utils';

export default function LandingHero() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imagePreloaded, setImagePreloaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Preload critical landing image
  useEffect(() => {
    preloadLandingImages().then(success => {
      setImagePreloaded(success);
    });
  }, []);

  useEffect(() => {
    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Trigger content animation after image starts loading
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    // Fallback to placeholder if main image fails
    setImageLoaded(true);
  };

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {(isVisible || imagePreloaded) && (
          <Image
            src="/images/landing-background.svg"
            alt="Elena Rodriguez artwork background"
            fill
            priority
            placeholder="blur"
            blurDataURL={generateBlurDataURL(1920, 1080)}
            className={`object-cover object-center transition-all duration-1200 ease-out ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            sizes="100vw"
            quality={95}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        {/* Overlay for better text readability */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/30 transition-opacity duration-1200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-300/20 to-primary-400/30" />
        </div>
      )}

      {/* Artist Name */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl w-full">
          <h1
            className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-light text-white tracking-wide drop-shadow-2xl transition-all duration-1000 ease-out ${
              showContent
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
            style={{
              textShadow:
                '0 4px 20px rgba(0,0,0,0.5), 0 8px 40px rgba(0,0,0,0.3)',
            }}
          >
            Elena Rodriguez
          </h1>
          <div
            className={`mt-6 w-24 h-px bg-white/70 mx-auto transition-all duration-1000 ease-out delay-500 ${
              showContent ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${
          showContent ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="w-px h-8 bg-white/40 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
