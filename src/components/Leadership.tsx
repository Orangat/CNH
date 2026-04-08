import React, { useRef } from 'react';
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

const LeaderCard: React.FC<CardProps> = ({ leader, index, language }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15, margin: '-80px 0px' });
  const visible = index < 6 || inView;

  const name = language === 'uk' && leader.name_uk ? leader.name_uk : leader.name_en;
  const title = language === 'uk' && leader.title_uk ? leader.title_uk : leader.title_en;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className="group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:shadow-navy-900/15 transition-shadow duration-500"
    >
      <div className="aspect-square overflow-hidden bg-navy-50">
        <img
          src={leaderPhotoUrl(leader.photo_path)}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="font-display text-base md:text-lg font-bold uppercase tracking-wider text-navy-900 leading-tight">
          {name}
        </h3>
        <p className="mt-2 text-xs md:text-sm font-semibold uppercase tracking-widest text-tan-500">
          {title}
        </p>
        {leader.emails && leader.emails.length > 0 && (
          <ul className="mt-4 space-y-1">
            {leader.emails.map((email) => (
              <li key={email} className="text-xs text-navy-700/70">
                <a href={`mailto:${email}`} className="hover:text-tan-500 transition-colors break-all">
                  {email}
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
