"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { ImageIcon } from "lucide-react";

interface ImageSliderProps {
   images: string[];
   className?: string;
   autoPlay?: boolean;
   autoPlayInterval?: number;
   showControls?: boolean;
   showIndicators?: boolean;
   aspectRatio?: string;
   placeholder?: string;
   children?: React.ReactNode;
   isRTL?: boolean;
}

export default function ImageSlider({
   images = [],
   className = "",
   autoPlay = false,
   autoPlayInterval = 5000,
   showControls = true,
   showIndicators = true,
   aspectRatio = "aspect-[16/9]",
   placeholder = "No images available",
   children,
   isRTL = false,
}: ImageSliderProps) {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
   const [touchStart, setTouchStart] = useState<number | null>(null);
   const [touchEnd, setTouchEnd] = useState<number | null>(null);

   const hasImages = images && images.length > 0;
   const hasMultipleImages = images && images.length > 1;

   // Auto-play functionality
   useEffect(() => {
      if (!isAutoPlaying || !hasMultipleImages) return;

      const interval = setInterval(() => {
         setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
   }, [isAutoPlaying, hasMultipleImages, images.length, autoPlayInterval]);

   // Navigation functions
   const goToPrevious = useCallback(() => {
      if (!hasMultipleImages) return;
      setCurrentIndex((prevIndex) =>
         prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
   }, [hasMultipleImages, images.length]);

   const goToNext = useCallback(() => {
      if (!hasMultipleImages) return;
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
   }, [hasMultipleImages, images.length]);

   const goToSlide = useCallback((index: number) => {
      setCurrentIndex(index);
   }, []);

   const containerRef = useRef<HTMLDivElement>(null);

   // Keyboard navigation - scoped to component
   const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
         if (event.key === "ArrowLeft") {
            goToPrevious();
         } else if (event.key === "ArrowRight") {
            goToNext();
         } else if (event.key === " ") {
            event.preventDefault();
            setIsAutoPlaying((prev) => !prev);
         }
      },
      [goToPrevious, goToNext]
   );

   // Touch/swipe handlers
   const minSwipeDistance = 50;

   const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
   };

   const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
   };

   const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe && hasMultipleImages) {
         goToNext();
      }
      if (isRightSwipe && hasMultipleImages) {
         goToPrevious();
      }
   };

   // Pause auto-play on hover
   const handleMouseEnter = () => {
      if (autoPlay) setIsAutoPlaying(false);
   };

   const handleMouseLeave = () => {
      if (autoPlay) setIsAutoPlaying(true);
   };

   if (!hasImages) {
      return (
         <div className={`relative ${aspectRatio} ${className}`}>
            <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-color)_95%,var(--utility-color))] rounded-b-3xl">
               <div className="text-center text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-lg font-medium">{placeholder}</p>
               </div>
            </div>
            {children}
         </div>
      );
   }

   return (
      <div
         ref={containerRef}
         className={`relative group ${aspectRatio} ${className}`}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onTouchStart={onTouchStart}
         onTouchMove={onTouchMove}
         onTouchEnd={onTouchEnd}
         onKeyDown={handleKeyDown}
         tabIndex={0}
         role="region"
         aria-label="Image slider - use arrow keys to navigate, space to pause/play"
      >
         {/* Image Container */}
         <div className="relative w-full h-full overflow-hidden rounded-b-3xl shadow-2xl shadow-[var(--utility-color)]/10">
            {hasImages && (
               <>
                  {/* Images positioned absolutely for smooth sliding */}
                  {images.map((image, index) => (
                     <div
                        key={index}
                        className="absolute inset-0 w-full h-full transition-all duration-500 ease-out"
                        style={{
                           transform: `translateX(${
                              (index - currentIndex) * 100
                           }%)`,
                           opacity: Math.abs(index - currentIndex) <= 1 ? 1 : 0,
                        }}
                     >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                           src={image}
                           alt={`Slide ${index + 1}`}
                           className="w-full h-full object-cover"
                           loading={index === 0 ? "eager" : "lazy"}
                        />
                     </div>
                  ))}

                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
               </>
            )}
         </div>

         {/* Navigation Controls */}
         {showControls && hasMultipleImages && (
            <>
               {/* Previous Button */}
               <button
                  onClick={goToPrevious}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 md:p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 z-20"
                  aria-label="Previous image"
               >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
               </button>

               {/* Next Button */}
               <button
                  onClick={goToNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 md:p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 z-20"
                  aria-label="Next image"
               >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
               </button>

               {/* Auto-play Toggle */}
               {autoPlay && (
                  <button
                     onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                     className={`absolute top-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl z-20 ${
                        isRTL ? "left-4" : "right-4"
                     }`}
                     aria-label={
                        isAutoPlaying ? "Pause slideshow" : "Play slideshow"
                     }
                  >
                     {isAutoPlaying ? (
                        <Pause className="w-4 h-4" />
                     ) : (
                        <Play className="w-4 h-4" />
                     )}
                  </button>
               )}
            </>
         )}

         {/* Slide Indicators */}
         {showIndicators && hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/30 rounded-full px-3 py-2">
               {images.map((_, index) => (
                  <button
                     key={index}
                     onClick={() => goToSlide(index)}
                     className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                        index === currentIndex
                           ? "bg-white scale-125 shadow-lg"
                           : "bg-white/60 hover:bg-white/80"
                     }`}
                     aria-label={`Go to slide ${index + 1}`}
                  />
               ))}
            </div>
         )}

         {/* Image Counter */}
         {hasMultipleImages && (
            <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               {currentIndex + 1} / {images.length}
            </div>
         )}

         {children}
      </div>
   );
}
