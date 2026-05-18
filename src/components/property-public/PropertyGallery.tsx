/**
 * Place this file at:
 *   src/components/property-public/PropertyGallery.tsx
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Building2, Star } from 'lucide-react';

interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface Props {
  images: PropertyImage[];
  title: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export default function PropertyGallery({ images, title, isAvailable, isFeatured }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (fading || index === activeIndex || images.length === 0) return;
      setFading(true);
      setTimeout(() => {
        setActiveIndex(index);
        setFading(false);
      }, 160);
    },
    [fading, activeIndex, images.length],
  );

  const prev = useCallback(() => goTo((activeIndex - 1 + images.length) % images.length), [activeIndex, images.length, goTo]);
  const next = useCallback(() => goTo((activeIndex + 1) % images.length), [activeIndex, images.length, goTo]);

  // Touch / pointer swipe
  const onPointerDown = (e: React.PointerEvent) => { pointerStart.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStart.current === null) return;
    const delta = e.clientX - pointerStart.current;
    if (Math.abs(delta) > 48) delta < 0 ? next() : prev();
    pointerStart.current = null;
  };

  if (!images.length) {
    return (
      <div className="rounded-3xl bg-gray-100 aspect-[4/3] sm:aspect-[16/9] flex flex-col items-center justify-center text-gray-300">
        <Building2 className="h-16 w-16 mb-3" />
        <p className="text-sm text-gray-400">No images available</p>
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="space-y-3">
      {/* ── Main image ── */}
      <div
        className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-[4/3] sm:aspect-[16/9] cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { pointerStart.current = null; }}
      >
        <Image
          key={active.id}
          src={active.url}
          alt={`${title} — photo ${activeIndex + 1}`}
          fill
          className={`object-cover transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
          priority={activeIndex === 0}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 960px"
          draggable={false}
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />

        {/* Status + Featured — top-left */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800/90 text-gray-200'
            }`}
          >
            {isAvailable ? '● Available' : '● Rented Out'}
          </span>
          {isFeatured && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md bg-amber-400 text-amber-900 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-800 text-amber-800" />
              Featured
            </span>
          )}
        </div>

        {/* Counter — top-right */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white pointer-events-none">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Dot indicators — mobile only */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip — desktop ── */}
      {images.length > 1 && (
        <div className="hidden sm:flex gap-2 overflow-x-auto pb-0.5">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative flex-shrink-0 h-[72px] w-[108px] rounded-xl overflow-hidden transition-all duration-200 ${
                i === activeIndex
                  ? 'ring-2 ring-orange-500 ring-offset-2 scale-[1.03]'
                  : 'opacity-50 hover:opacity-80 hover:scale-[1.02]'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="108px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}