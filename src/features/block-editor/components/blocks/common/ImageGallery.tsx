import { useState, useRef, useEffect } from 'react';
import type { ImageGalleryContent } from '../../../types/blocks';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  content: ImageGalleryContent;
}

export default function ImageGallery({ content }: ImageGalleryProps) {
  const { images = [], layout = 'grid' } = content;

  if (images.length === 0) {
    return (
      <div className="w-full h-48 theme-rounded theme-surface flex items-center justify-center border theme-border">
        <div className="text-center theme-text-secondary">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Henüz resim eklenmedi</p>
        </div>
      </div>
    );
  }

  if (layout === 'carousel') {
    return <Carousel images={images} />;
  }

  return (
    <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
      {images.map((img, index) => (
        <div key={index} className="space-y-1">
          <img
            src={img.url}
            alt={img.caption || `Image ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg"
          />
          {img.caption && (
            <p className="text-xs theme-text-secondary">{img.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}

interface CarouselProps {
  images: Array<{ url: string; caption?: string }>;
}

function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.offsetWidth;
      container.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative group">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, index) => (
          <div key={index} className="min-w-full snap-center">
            <div className="px-1">
              <img
                src={img.url}
                alt={img.caption || `Resim ${index + 1}`}
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
              />
              {img.caption && (
                <p className="text-sm theme-text-secondary text-center mt-2">{img.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            aria-label="Önceki resim"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#111827' }} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            aria-label="Sonraki resim"
          >
            <ChevronRight className="w-5 h-5" style={{ color: '#111827' }} />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className="transition-all rounded-full"
                style={{
                  width: index === currentIndex ? '2rem' : '0.5rem',
                  height: '0.5rem',
                  backgroundColor: index === currentIndex ? 'var(--theme-primary)' : 'var(--theme-border)',
                }}
                aria-label={`${index + 1}. resme git`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
