import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useLeaders } from '../data/useLeaders';
import { leaderPhotoUrl } from '../lib/supabase';
import { LeaderRow } from '../data/types';
import { stockPhotos } from '../data/stockImages';
import Hero from './redesign/Hero';
import Section from './redesign/Section';

interface CardProps {
  leader: LeaderRow;
  index: number;
  language: 'en' | 'uk';
  onPhotoClick: (leader: LeaderRow) => void;
}

/** Extract up to two initials for a monogram placeholder. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Placeholder shown when a leader has no photo — editorial monogram. */
const MonogramPlaceholder: React.FC<{ name: string }> = ({ name }) => {
  const initials = getInitials(name);
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-cream via-[#F1EBDF] to-tan-50">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-tan-500/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-16 h-60 w-60 rounded-full border border-tan-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(10,42,70,0.03) 0 1px, transparent 1px 18px)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif italic text-[6.5rem] md:text-[7.5rem] leading-none font-light text-navy-900/85 tracking-tight">
          {initials}
        </span>
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="h-px w-6 bg-tan-500/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy-900/40">
          New Hope
        </span>
        <span className="h-px w-6 bg-tan-500/60" />
      </div>
    </div>
  );
};

const LeaderCard: React.FC<CardProps> = ({ leader, index, language, onPhotoClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15, margin: '-80px 0px' });
  const visible = index < 6 || inView;
  const [imgFailed, setImgFailed] = useState(false);

  const name = language === 'uk' && leader.name_uk ? leader.name_uk : leader.name_en;
  const title = language === 'uk' && leader.title_uk ? leader.title_uk : leader.title_en;

  const hasPhoto = Boolean(leader.photo_path) && !imgFailed;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className="relative bg-white border border-navy-900/[0.06]"
    >
      {/* Photo / monogram area */}
      <div
        className={`group relative aspect-square overflow-hidden ${hasPhoto ? 'cursor-zoom-in' : ''}`}
        onClick={hasPhoto ? () => onPhotoClick(leader) : undefined}
        role={hasPhoto ? 'button' : undefined}
        tabIndex={hasPhoto ? 0 : undefined}
        onKeyDown={hasPhoto ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPhotoClick(leader); } } : undefined}
        aria-label={hasPhoto ? `View larger photo of ${name}` : undefined}
      >
        {hasPhoto ? (
          <>
            <img
              src={leaderPhotoUrl(leader.photo_path)}
              alt={name}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 flex items-center justify-center bg-navy-900/0 group-hover:bg-navy-900/30 transition-colors duration-300">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 rounded-full p-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-900">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <MonogramPlaceholder name={name} />
        )}
        <div className="absolute bottom-0 left-0 h-[2px] w-12 bg-tan-500" aria-hidden />
      </div>

      {/* Text area */}
      <div className="p-6 md:p-7">
        <h3 className="font-display text-base md:text-lg font-bold uppercase tracking-wider text-navy-900 leading-tight">
          {name}
        </h3>
        <p className="mt-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-tan-500">
          {title}
        </p>
        {leader.emails && leader.emails.length > 0 && (
          <ul className="mt-5 space-y-1.5 border-t border-navy-900/[0.08] pt-4">
            {leader.emails.map((email) => (
              <li key={email} className="text-xs text-navy-700/70">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 hover:text-tan-500 transition-colors break-all"
                >
                  <span className="text-tan-500 text-[11px]">✉</span>
                  <span>{email}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
};

const PhotoLightbox: React.FC<{
  leader: LeaderRow;
  language: 'en' | 'uk';
  onClose: () => void;
}> = ({ leader, language, onClose }) => {
  const name = language === 'uk' && leader.name_uk ? leader.name_uk : leader.name_en;
  const title = language === 'uk' && leader.title_uk ? leader.title_uk : leader.title_en;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

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
      aria-label={`Photo of ${name}`}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 md:top-6 md:right-6 flex h-12 w-12 items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Photo + caption (click inside doesn't close) */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl w-full max-h-[calc(100vh-4rem)] flex flex-col items-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={leaderPhotoUrl(leader.photo_path)}
          alt={name}
          className="max-h-[calc(100vh-10rem)] w-auto object-contain border-4 border-white/10"
        />
        <div className="mt-4 text-center text-white">
          <h3 className="font-display text-lg md:text-xl font-bold uppercase tracking-wider">{name}</h3>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-tan-500">{title}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Leadership: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: leaders } = useLeaders();
  const [preview, setPreview] = useState<LeaderRow | null>(null);

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.congregation.src(2000)}
        eyebrow={t('leadership.eyebrow')}
        scriptAccent={t('home.leadershipPreview.eyebrow')}
        title={t('leadership.title')}
        description={t('leadership.subtitle')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader, i) => (
            <LeaderCard
              key={leader.id}
              leader={leader}
              index={i}
              language={language}
              onPhotoClick={setPreview}
            />
          ))}
        </div>
      </Section>

      <AnimatePresence>
        {preview && (
          <PhotoLightbox
            leader={preview}
            language={language}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leadership;
