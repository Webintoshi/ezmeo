"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Using native img tag to avoid R2 CORS issues with Next.js Image optimization

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

  // Ensure images is an array
  const safeImages = Array.isArray(images) ? images : [];
  
  // Debug: Log images with details
  console.log('ImageGallery - Raw images:', JSON.stringify(safeImages));
  console.log('ImageGallery - First image URL:', safeImages?.[0]);
  
  // Filter valid images - allow any non-empty string URL
  const displayImages = safeImages.filter(img => 
    img && typeof img === 'string' && img.trim() !== ''
  );
  
  console.log('ImageGallery - Filtered images:', displayImages.length);
  console.log('ImageGallery - First filtered URL:', displayImages?.[0]);

  if (displayImages.length === 0) {
    return (
      <div className="relative aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
        <svg className="w-20 h-20 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2"/>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2"/>
        </svg>
        <p className="text-sm font-medium text-gray-500">Henüz görsel eklenmemiş</p>
        <p className="text-xs text-gray-400 mt-2">Debug: {images?.length || 0} raw, {displayImages.length} valid</p>
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
  };

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set([...prev, index]));
  };

  // Touch events (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNext() : handlePrevious();
    }
  };

  // Mouse events (desktop drag)
  const [isDragging, setIsDragging] = useState(false);
  const mouseStartX = useRef(0);
  const mouseEndX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    mouseStartX.current = e.clientX;
    mouseEndX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    mouseEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = mouseStartX.current - mouseEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNext() : handlePrevious();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const diff = mouseStartX.current - mouseEndX.current;
      if (Math.abs(diff) > 50) {
        diff > 0 ? handleNext() : handlePrevious();
      }
    }
  };

  const isLoaded = loadedImages.has(selectedIndex);
  const isFailed = failedImages.has(selectedIndex);

  // TEK GÖRSEL
  if (displayImages.length === 1) {
    return (
      <div className="w-full">
        <div
          className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          {!isLoaded && !isFailed && (
            <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}
          {!isFailed ? (
            <img
              src={displayImages[0]}
              alt={productName}
              className="w-full h-full object-contain"
              loading="eager"
              fetchPriority="high"
              onLoad={() => handleImageLoad(0)}
              onError={() => handleImageError(0)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L20 14M10 4v4m0 0H4m6 0h6" />
              </svg>
              <p className="text-sm text-gray-500">Görsel yüklenemedi</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setIsLightboxOpen(false)}
            >
              <button className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center z-10">
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={displayImages[0]}
                alt={productName}
                className="max-w-full max-h-full object-contain p-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Scroll işlemleri için ref
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    if (thumbnailsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = thumbnailsRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5);
    }
  }, []);

  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 100;
      thumbnailsRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  // ÇOKLU GÖRSEL - Sol thumbnails, Sağ ana görsel (Tüm cihazlar)
  return (
    <div className="w-full">
      <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[100px_1fr] gap-3 sm:gap-4 h-[400px] sm:h-[500px] lg:h-[600px]">
        {/* Sol: Dikey Thumbnails - Scroll edilebilir */}
        <div className="relative flex flex-col h-full">
          {/* Yukarı ok */}
          {displayImages.length > 3 && (
            <button
              onClick={() => scrollThumbnails('up')}
              className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-opacity ${
                canScrollUp ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronLeft className="w-3 h-3 text-gray-600 -rotate-90" />
            </button>
          )}
          
          {/* Thumbnails container - Scroll edilebilir */}
          <div 
            ref={thumbnailsRef}
            onScroll={checkScroll}
            className="flex flex-col gap-2 sm:gap-3 overflow-y-auto scrollbar-hide h-full py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square w-full flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`${productName} - ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          
          {/* Aşağı ok */}
          {displayImages.length > 3 && (
            <button
              onClick={() => scrollThumbnails('down')}
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-opacity ${
                canScrollDown ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronRight className="w-3 h-3 text-gray-600 rotate-90" />
            </button>
          )}
        </div>

        {/* Sağ: Ana Görsel - Swipe ve Drag destekli */}
        <div
          className={`relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-${isDragging ? 'grabbing' : 'pointer'}`}
          onClick={() => setIsLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {!isLoaded && !isFailed && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}

          <AnimatePresence mode="wait">
            {!isFailed ? (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <img
                  src={displayImages[selectedIndex]}
                  alt={`${productName} - Görsel ${selectedIndex + 1}`}
                  className="w-full h-full object-contain"
                  onLoad={() => handleImageLoad(selectedIndex)}
                  onError={() => handleImageError(selectedIndex)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-gray-100 to-gray-200"
              >
                <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L20 14M10 4v4m0 0H4m6 0h6" />
                </svg>
                <p className="text-sm text-gray-500">Görsel yüklenemedi</p>
              </motion.div>
            )}
          </AnimatePresence>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                aria-label="Önceki"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                aria-label="Sonraki"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(index); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex ? "bg-primary w-6" : "bg-gray-400 hover:bg-gray-600"
                }`}
                aria-label={`Görsel ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

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
              <img
                src={displayImages[selectedIndex]}
                alt={productName}
                className="max-w-full max-h-full object-contain"
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
