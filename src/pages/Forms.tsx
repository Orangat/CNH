import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

interface FormLink {
  key: string;
  href: string;
  icon: string;
}

interface FormGroup {
  key: string;
  forms: FormLink[];
}

const formGroups: FormGroup[] = [
  {
    key: 'connect',
    forms: [
      {
        key: 'connectCard',
        href: 'https://churchofnewhope.churchcenter.com/people/forms/922690',
        icon: 'hand-holding-heart',
      },
      {
        key: 'serveTeam',
        href: 'https://churchofnewhope.churchcenter.com/people/forms/922679',
        icon: 'hands-helping',
      },
      {
        key: 'membership',
        href: 'https://churchofnewhope.churchcenter.com/people/forms/1092931',
        icon: 'address-card',
      },
    ],
  },
  {
    key: 'requests',
    forms: [
      {
        key: 'building',
        href: 'https://churchofnewhope.churchcenter.com/calendar/forms/22891',
        icon: 'church',
      },
      {
        key: 'operator',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSdaeh4vs-_HN0CcYM3yT_XuYdei-hkGmeDPsV25yt4XO2C9cg/viewform?usp=dialog',
        icon: 'headset',
      },
      {
        key: 'sermonSlides',
        href: 'https://forms.gle/wrt6AYAjmS1MXoDHA',
        icon: 'display',
      },
      {
        key: 'graphic',
        href: 'https://forms.gle/X6WWjyZsajFANwQJ6',
        icon: 'palette',
      },
    ],
  },
];

const FormCard: React.FC<{ form: FormLink; index: number; t: (k: string) => string }> = ({
  form,
  index,
  t,
}) => (
  <motion.a
    href={form.href}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    className="group flex flex-col bg-white border border-navy-900/10 p-8 hover:border-tan-500 hover:shadow-2xl hover:shadow-navy-900/10 transition-all"
  >
    <div className="flex h-14 w-14 items-center justify-center bg-navy-50 text-navy-700 group-hover:bg-tan-500 group-hover:text-white transition-colors">
      <i className={`fas fa-${form.icon} text-xl`} />
    </div>
    <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-wider text-navy-900">
      {t(`forms.items.${form.key}.title`)}
    </h3>
    <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-700/85">
      {t(`forms.items.${form.key}.desc`)}
    </p>
    <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tan-500 group-hover:gap-3 transition-all">
      {t('forms.openForm')} →
    </span>
  </motion.a>
);

const Forms: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.community.src(2000)}
        eyebrow={t('forms.hero.eyebrow')}
        title={t('forms.hero.title')}
        description={t('forms.hero.description')}
        height="short"
      />

      {formGroups.map((group, gi) => (
        <Section key={group.key} variant={gi % 2 === 0 ? 'cream' : 'white'} padding="lg">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-tan-500">
              {t(`forms.groups.${group.key}.eyebrow`)}
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-navy-900">
              {t(`forms.groups.${group.key}.title`)}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {group.forms.map((form, i) => (
              <FormCard key={form.key} form={form} index={i} t={t} />
            ))}
          </div>
        </Section>
      ))}

      <Section variant="navy" padding="md">
        <div className="text-center max-w-2xl mx-auto">
          <i className="fas fa-circle-question text-tan-500 text-2xl" />
          <p className="mt-4 font-display text-xl md:text-2xl">{t('forms.help.title')}</p>
          <p className="mt-3 text-sm text-white/70">{t('forms.help.body')}</p>
        </div>
      </Section>
    </div>
  );
};

export default Forms;
