"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Filter valid images
  const displayImages = images.filter(img => 
    img && typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))
  );

  if (displayImages.length === 0) {
    return (
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
        <svg className="w-20 h-20 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2"/>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2"/>
        </svg>
        <p className="text-sm font-medium text-gray-500">Henüz görsel eklenmemiş</p>
      </div>
    );
  }

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
    setFailedImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set([...prev, index]));
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const isLoaded = loadedImages.has(selectedIndex);
  const isFailed = failedImages.has(selectedIndex);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group w-full">
        <div
          className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Skeleton Loading State */}
          {!isLoaded && !isFailed && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}

          {/* Main Image with Next.js Image */}
          <AnimatePresence mode="wait">
            {!isFailed ? (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Image
                  src={displayImages[selectedIndex]}
                  alt={`${productName} - Görsel ${selectedIndex + 1}`}
                  fill
                  priority={selectedIndex === 0}
                  loading={selectedIndex === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-contain"
                  onLoad={() => handleImageLoad(selectedIndex)}
                  onError={() => handleImageError(selectedIndex)}
                  quality={85}
                />
              </motion.div>
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
              >
                <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L20 14M10 4v4m0 0H4m6 0h6" />
                </svg>
                <p className="text-sm text-gray-500">Görsel yüklenemedi</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 focus:opacity-100"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 focus:opacity-100"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-4 lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full justify-start lg:justify-center">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-primary w-6"
                    : "bg-gray-400 hover:bg-gray-600"
                }`}
                aria-label={`Görsel ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 md:gap-3 w-full justify-items-start">
          {displayImages.slice(0, 5).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all w-full ${
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Küçük görsel ${index + 1}`}
                fill
                loading="lazy"
                sizes="100px"
                className="object-cover"
                quality={60}
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center z-10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div 
              className="relative w-full h-full flex items-center justify-center p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={displayImages[selectedIndex]}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                quality={90}
              />
            </div>

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Lightbox pagination */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {displayImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
