import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useMinistries } from '../data/useMinistries';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const Ministries: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: ministries, loading } = useMinistries();

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.community.src(2000)}
        eyebrow={t('ministries.hero.eyebrow')}
        scriptAccent={t('ministries.hero.script')}
        title={t('ministries.hero.title')}
        description={t('ministries.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        {loading ? (
          <p className="text-center text-navy-700/60">Loading…</p>
        ) : ministries.length === 0 ? (
          <p className="text-center text-navy-700/60">{t('ministries.empty')}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ministries.map((m, i) => {
              const name = language === 'uk' && m.name_uk ? m.name_uk : m.name_en;
              const description = language === 'uk' && m.description_uk
                ? m.description_uk
                : m.description_en;
              const meeting = language === 'uk' && m.meeting_info_uk
                ? m.meeting_info_uk
                : m.meeting_info_en;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="group bg-white border border-navy-900/10 p-8 hover:border-tan-500 hover:shadow-2xl hover:shadow-navy-900/10 transition-all"
                >
                  <div className="flex h-14 w-14 items-center justify-center bg-navy-50 text-navy-700 group-hover:bg-tan-500 group-hover:text-white transition-colors">
                    <i className={`fas fa-${m.icon || 'users'} text-xl`} />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-wider text-navy-900">
                    {name}
                  </h3>
                  {description && (
                    <p className="mt-4 text-sm leading-relaxed text-navy-700/85">{description}</p>
                  )}
                  {meeting && (
                    <p className="mt-4 text-xs uppercase tracking-wider text-navy-700/60">
                      {meeting}
                    </p>
                  )}
                  {m.contact_email && (
                    <a
                      href={`mailto:${m.contact_email}`}
                      className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tan-500 hover:gap-3 transition-all"
                    >
                      {t('ministries.contact')} →
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
};

export default Ministries;
