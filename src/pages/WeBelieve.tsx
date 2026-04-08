import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const beliefs = [
  'god',
  'bible',
  'man',
  'salvation',
  'assurance',
  'duties',
  'church',
  'ordinances',
  'lastThings',
] as const;

const WeBelieve: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.openBible.src(2000)}
        eyebrow={t('weBelieve.hero.eyebrow')}
        scriptAccent={t('weBelieve.hero.script')}
        title={t('weBelieve.hero.title')}
        description={t('weBelieve.hero.description')}
        height="tall"
      />

      <Section variant="cream" padding="lg">
        <div className="mx-auto max-w-4xl">
          {beliefs.map((key, i) => {
            const open = openIndex === i;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                className="border-b border-navy-900/10"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-8 text-left cursor-pointer group"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="font-script text-3xl text-tan-500">{`0${i + 1}`}</span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide text-navy-900 group-hover:text-navy-700 transition-colors">
                      {t(`weBelieve.${key}.title`)}
                    </h3>
                  </div>
                  <span className={`text-3xl text-tan-500 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 pl-12 text-base md:text-lg leading-relaxed text-navy-700/85 max-w-3xl">
                        {t(`weBelieve.${key}.text`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Section>

      <Section variant="navy" padding="md">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-script text-3xl text-tan-500">{t('weBelieve.findUs')}</p>
          <p className="mt-4 text-lg text-white/85">{t('weBelieve.comeAsYouAre')}</p>
        </div>
      </Section>
    </div>
  );
};

export default WeBelieve;
