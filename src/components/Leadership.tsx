import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
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
      {/* decorative rings */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-tan-500/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-16 h-60 w-60 rounded-full border border-tan-500/15"
        aria-hidden
      />
      {/* subtle diagonal line */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(10,42,70,0.03) 0 1px, transparent 1px 18px)',
        }}
        aria-hidden
      />
      {/* monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif italic text-[6.5rem] md:text-[7.5rem] leading-none font-light text-navy-900/85 tracking-tight">
          {initials}
        </span>
      </div>
      {/* small brand mark at bottom */}
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

const LeaderCard: React.FC<CardProps> = ({ leader, index, language }) => {
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
      <div className="relative aspect-square overflow-hidden">
        {hasPhoto ? (
          <img
            src={leaderPhotoUrl(leader.photo_path)}
            alt={name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <MonogramPlaceholder name={name} />
        )}
        {/* Thin tan accent line at bottom of photo */}
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

const Leadership: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: leaders } = useLeaders();

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
            <LeaderCard key={leader.id} leader={leader} index={i} language={language} />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Leadership;
