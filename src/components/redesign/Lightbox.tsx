import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Generic full-screen image lightbox with keyboard/arrow navigation.
 * (The leadership page has its own leader-specific variant; this one takes
 * plain image URLs so it can be reused for ministry galleries etc.)
 */
export const Lightbox: React.FC<{
  images: string[];
  index: number;
  caption?: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}> = ({ images, index, caption, onClose, onNavigate }) => {
  const hasMultiple = images.length > 1;
  const goPrev = useCallback(() => onNavigate((index - 1 + images.length) % images.length), [index, images.length, onNavigate]);
  const goNext = useCallback(() => onNavigate((index + 1) % images.length), [index, images.length, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, goPrev, goNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/90 backdrop-blur-sm p-4 md:p-8 cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={caption ? `Photo — ${caption}` : 'Photo'}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex h-12 w-12 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next photo"
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl w-full max-h-[calc(100vh-4rem)] flex flex-col items-center"
        >
          <img
            src={images[index]}
            alt={caption ?? ''}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[calc(100vh-8rem)] w-auto object-contain border-4 border-white/10 cursor-default"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Lightbox;
