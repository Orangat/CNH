import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useContactInfo } from '../data/useContactInfo';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';
import Button from '../components/redesign/Button';

const sectionKeys = ['what', 'wear', 'kids', 'parking', 'language', 'questions'] as const;

const Visit: React.FC = () => {
  const { t } = useLanguage();
  const { data: contact } = useContactInfo();

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.welcome.src(2000)}
        eyebrow={t('visit.hero.eyebrow')}
        scriptAccent={t('visit.hero.script')}
        title={t('visit.hero.title')}
        description={t('visit.hero.description')}
        height="tall"
      >
        <Button href={contact.map_url} variant="primary" size="lg">
          {t('visit.cta')} →
        </Button>
      </Hero>

      <Section variant="cream" padding="lg">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sectionKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="bg-white p-8 border border-navy-900/10"
            >
              <div className="font-script text-3xl text-tan-500">{`0${i + 1}`}</div>
              <h3 className="mt-3 font-display text-xl font-bold uppercase tracking-wider text-navy-900">
                {t(`visit.sections.${key}.title`)}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-navy-700/85">
                {t(`visit.sections.${key}.body`)}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Map / address card */}
      <Section variant="navy" padding="lg">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-tan-500">
              {t('weBelieve.findUs')}
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold uppercase leading-tight">
              Church of New Hope
            </h2>
            <p className="mt-6 text-lg text-white/85">{contact.address}</p>
            <p className="mt-2 text-white/70">
              {t('home.sundays')} · {contact.service_time_english} ({t('home.english')}) · {contact.service_time_ukrainian} ({t('home.ukrainian')})
            </p>
            <div className="mt-8">
              <Button href={contact.map_url} variant="primary">
                {t('visit.cta')} →
              </Button>
            </div>
          </div>
          <div className="aspect-video bg-navy-800 overflow-hidden border-4 border-tan-500">
            <iframe
              title="Church of New Hope on Google Maps"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Visit;
