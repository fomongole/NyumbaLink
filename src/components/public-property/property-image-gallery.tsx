'use client';

import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Building2, ZoomIn } from 'lucide-react';

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

export default function PropertyImageGallery({ images, title, isAvailable, isFeatured }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Touch / drag state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const MIN_SWIPE = 50;

  const total = images.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % total);
      else if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + total) % total);
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, total]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  if (total === 0) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-gray-100 aspect-video flex flex-col items-center justify-center text-gray-400">
        <Building2 className="h-16 w-16 mb-2" />
        <p className="text-sm">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Main slider ── */}
      <div className="space-y-2">
        <div
          className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-video group cursor-zoom-in select-none"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            touchEndX.current = e.changedTouches[0].clientX;
            const delta = (touchStartX.current ?? 0) - (touchEndX.current ?? 0);
            if (Math.abs(delta) >= MIN_SWIPE) delta > 0 ? next() : prev();
          }}
          onClick={() => openLightbox(current)}
        >
          {/* Slides */}
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ width: `${total * 100}%`, transform: `translateX(-${(current / total) * 100}%)` }}
          >
            {images.map((img) => (
              <div key={img.id} className="relative h-full" style={{ width: `${100 / total}%` }}>
                <Image
                  src={img.url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority={img.isPrimary}
                  sizes="(max-width: 768px) 100vw, 900px"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/40 rounded-full p-2">
              <ZoomIn className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Prev / Next buttons — only show if more than one image */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Status badges */}
          <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow ${isAvailable ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
              {isAvailable ? 'Available' : 'Rented Out'}
            </span>
            {isFeatured && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full shadow bg-yellow-400 text-yellow-900">
                ★ Featured
              </span>
            )}
          </div>

          {/* Counter badge */}
          {total > 1 && (
            <span className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none">
              {current + 1} / {total}
            </span>
          )}
        </div>

        {/* ── Dot + thumbnail strip ── */}
        {total > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrent(idx)}
                className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                  idx === current
                    ? 'ring-2 ring-orange-500 ring-offset-1 opacity-100'
                    : 'opacity-60 hover:opacity-90'
                }`}
                style={{ width: 68, height: 48 }}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="68px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox — mounted via portal so it escapes any stacking context ── */}
      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
          onClick={() => setLightboxOpen(false)}
        >
          {/* ── Top bar: counter + close ── */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/60 text-sm tabular-nums">
              {lightboxIndex + 1} / {total}
            </span>
            <button
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Image area — fills all available vertical space ── */}
          <div className="relative flex-1 flex items-center justify-center min-h-0">
            {/* Prev */}
            {total > 1 && (
              <button
                className="absolute left-3 z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + total) % total); }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* The image fills height; object-contain keeps aspect ratio without any forced container ratio */}
            <div
              className="relative w-full h-full px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex].url}
                alt={`${title} — image ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Next */}
            {total > 1 && (
              <button
                className="absolute right-3 z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % total); }}
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* ── Thumbnail strip ── */}
          {total > 1 && (
            <div
              className="shrink-0 flex gap-2 justify-center overflow-x-auto px-4 py-3"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all ${
                    idx === lightboxIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{ width: 60, height: 42 }}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="60px" />
                </button>
              ))}
            </div>
          )}
        </div>
      , document.body)}
    </>
  );
}