"use client"

import { get_asset_url } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

export interface ProjectSubImage {
  id?: number;
  src: string;
  title: string;
  description: string;
  projectID?: number;
}

export default function ImageCarousel({ images, className = "" }: { images: ProjectSubImage[], className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Controls the overall visibility of the navigation dots and descriptions
  const [showNav, setShowNav] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    // Stops the click from bubbling up to the container and toggling visibility
    e.stopPropagation(); 
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;
    container.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  // Track user scrolling to update active index dynamically
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      threshold: 0.6,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-index');
          if (id !== null) {
            setActiveIndex(parseInt(id, 10));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const slides = container.querySelectorAll('[data-index]');
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [images]);

  return (
    <div className={`relative w-full max-w-4xl mx-auto group ${className}`}>
      {/* Scroll Container */}
      <div 
        ref={scrollContainerRef}
        // Clicking anywhere on the slide deck toggles navigation UI visibility
        onClick={() => setShowNav(!showNav)}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar cursor-pointer"
      >
        {images.map((image, index) => (
          <div 
            key={image.id || index} 
            data-index={index}
            className="
              dark:bg-black
              bg-gray-400
              min-w-full
              h-fit
              snap-start 
              snap-always 
              relative 
              aspect-video
              select-none
            "
          >
            <img 
              src={get_asset_url(image.src)} 
              alt={image.title || `Slide ${index}`} 
              className="absolute inset-0 w-full h-full object-contain" 
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
            {image.description && (
              <div className={`
                dark:bg-black/70
                bg-white/70
                absolute
                transition-all
                duration-300
                w-full
                flex
                justify-center
                p-2
                ${showNav ? 'opacity-100 top-0' : 'opacity-0 -top-12 pointer-events-none'}
              `}>
                {image.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className={`
        absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 p-6 w-full justify-center transition-all duration-300
        ${showNav ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => handleDotClick(e, index)}
            className={`
              dark:border-gray-400/90
              dark:hover:bg-white
              border-white/90
              hover:bg-white
              rounded-full
              w-5 h-5
              mix-blend-difference
              border-2
              border-solid
              transition-all
              ${activeIndex === index ? 'bg-white scale-110' : 'dark:bg-gray-900/80 bg-gray-300/80'}
            `}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
