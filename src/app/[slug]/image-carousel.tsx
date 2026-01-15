import { ProjectSubImage } from '@/generated/prisma';
import Image from 'next/image';
import { Fragment } from 'react/jsx-runtime';

export default function ImageCarousel({ images, className = "" }: { images: ProjectSubImage[], className?:string }) {
  return (
    <div className={`relative w-full max-w-4xl mx-auto group ${className}`}>
      {/* Scroll Container */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
        {images.map((image, index) => (
          <Fragment key={index}>
            <div 
              key={index} 
              id={`slide-${index}`}
              className="
              dark:bg-black
              bg-gray-400
                min-w-full
                h-fit
                snap-start 
                snap-always 
                relative 
                aspect-video 
              "
            >
              <Image 
                src={image.src} 
                alt={`Slide ${index}`} 
                fill 
                className="object-contain peer" 
                priority={index === 0} 
              />
              {
                image.description === "" ? <></> :
                <div className='
                dark:bg-black/70
                bg-white/70
                  absolute
                  transition-all
                  w-full
                  flex
                  justify-center
                  p-2
                  opacity-0
                  peer-hover:opacity-100
                '>
                  {image.description}
                </div>
              }
            </div>
          </Fragment>
        ))}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 p-6 group/nav w-full justify-center">
        {images.map((_, index) => (
          <a
            key={index}
            href={`#slide-${index}`}
            className="
            dark:bg-gray-900/80
            dark:border-gray-400/90
            dark:hover:bg-white
            bg-gray-300/80
            border-white/90
            hover:bg-white
            hover:rounded-none
            rounded-full
            w-5 h-5
            mix-blend-difference
            border-2
            border-solid
            transition-all
            opacity-0
            group-hover/nav:opacity-100
            "
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
