import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Photo {
  url: string;
  isProfilePhoto?: boolean;
  id?: string;
  _id?: string;
}

interface PhotoGalleryModalProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function PhotoGalleryModal({ photos, isOpen, onClose, initialIndex = 0 }: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoading(true);
      setImageError(false);
    }
  }, [isOpen, initialIndex]);

  // Preload next and previous images
  useEffect(() => {
    if (!isOpen || !photos || photos.length === 0) return;

    const preloadImages = () => {
      const indicesToPreload = [
        currentIndex,
        currentIndex + 1 < photos.length ? currentIndex + 1 : 0,
        currentIndex - 1 >= 0 ? currentIndex - 1 : photos.length - 1,
      ];

      indicesToPreload.forEach((index) => {
        const photo = photos[index];
        if (photo?.url && !loadedImages.has(photo.url)) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(photo.url));
          };
          img.onerror = () => {
            // Silently handle preload errors
          };
          img.src = photo.url;
        }
      });
    };

    preloadImages();
  }, [isOpen, currentIndex, photos, loadedImages]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const prevIndex = prev > 0 ? prev - 1 : photos.length - 1;
      setImageLoading(true);
      setImageError(false);
      return prevIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev < photos.length - 1 ? prev + 1 : 0;
      setImageLoading(true);
      setImageError(false);
      return nextIndex;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose, currentIndex]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const imageUrl = currentPhoto?.url;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Next Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Main Photo */}
          <div className="w-full h-full flex items-center justify-center p-4 relative">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            {imageError ? (
              <div className="flex flex-col items-center justify-center text-white">
                <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg mb-2">Failed to load image</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImageError(false);
                    setImageLoading(true);
                  }}
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  Retry
                </Button>
              </div>
            ) : imageUrl ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={`Photo ${currentIndex + 1}`}
                className={cn(
                  "max-w-full max-h-full object-contain transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No image available</p>
              </div>
            )}
          </div>

          {/* Photo Counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          )}

          {/* Thumbnail Strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-16 left-0 right-0 px-4">
              <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.url || index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setImageLoading(true);
                      setImageError(false);
                    }}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative',
                      index === currentIndex
                        ? 'border-white scale-110'
                        : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                    )}
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23333" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

