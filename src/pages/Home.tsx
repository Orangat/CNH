import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLeaders } from '../data/useLeaders';
import { useContactInfo } from '../data/useContactInfo';
import { stockPhotos } from '../data/stockImages';
import { leaderPhotoUrl } from '../lib/supabase';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';
import SectionHeading from '../components/redesign/SectionHeading';
import Button from '../components/redesign/Button';
import BrandPattern from '../components/redesign/BrandPattern';

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const { data: leaders } = useLeaders();
  const { data: contact } = useContactInfo();
  const localized = (path: string) => `/${lang || language}${path}`;

  // First three published leaders for preview section
  const previewLeaders = leaders.slice(0, 3);

  const expectItems = [
    { key: 'worship', icon: WorshipIcon },
    { key: 'teaching', icon: TeachingIcon },
    { key: 'kids', icon: KidsIcon },
    { key: 'fellowship', icon: FellowshipIcon },
  ];

  return (
    <div className="bg-cream">
      {/* ============================================================ HERO */}
      <Hero
        image={stockPhotos.worshipHands.src(2000)}
        eyebrow={t('home.hero.eyebrow')}
        scriptAccent={t('home.hero.script')}
        title={t('home.hero.title')}
        description={t('home.hero.description')}
        height="full"
      >
        <Button to={localized('/visit')} variant="primary" size="lg">
          {t('home.hero.ctaPrimary')} →
        </Button>
        <Button to={localized('/sermons')} variant="outline" size="lg">
          {t('home.hero.ctaSecondary')}
        </Button>
      </Hero>

      {/* ====================================================== SERVICE TIMES strip */}
      <div className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 bg-navy-900 text-white shadow-2xl shadow-navy-900/30">
          <div className="border-b md:border-b-0 md:border-r border-white/10 p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-tan-500 font-bold">{t('home.sundays')}</p>
            <p className="mt-3 font-display text-3xl font-bold">{contact.service_time_english}</p>
            <p className="mt-1 text-sm text-white/70">{t('home.english')}</p>
          </div>
          <div className="border-b md:border-b-0 md:border-r border-white/10 p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-tan-500 font-bold">{t('home.sundays')}</p>
            <p className="mt-3 font-display text-3xl font-bold">{contact.service_time_ukrainian}</p>
            <p className="mt-1 text-sm text-white/70">{t('home.ukrainian')}</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-tan-500 font-bold">{t('nav.visit')}</p>
            <p className="mt-3 font-display text-base leading-tight">{contact.address}</p>
            <a href={contact.map_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs uppercase tracking-widest text-tan-500 hover:text-white transition-colors">
              {t('visit.cta')} →
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ WELCOME */}
      <Section variant="cream" padding="lg">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-tan-500">{t('home.welcome.eyebrow')}</p>
            <p className="mt-3 font-script text-4xl text-navy-700">{t('home.hero.script')}</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold uppercase leading-tight text-navy-900">
              {t('home.welcome.title')}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-700/85">{t('home.welcome.body')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to={localized('/visit')} variant="secondary">{t('nav.planVisit')} →</Button>
              <Button to={localized('/we-believe')} variant="ghost" className="!text-navy-900 hover:!bg-navy-900/5">
                {t('nav.weBelieve')}
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={stockPhotos.community.src(1200)}
                alt={stockPhotos.community.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden md:block w-32 h-32 border-4 border-tan-500" />
          </motion.div>
        </div>
      </Section>

      {/* ============================================================ WHAT TO EXPECT */}
      <Section variant="white" padding="lg">
        <SectionHeading
          eyebrow={t('home.expect.eyebrow')}
          title={t('home.expect.title')}
        />
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {expectItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 border border-navy-900/10 hover:border-tan-500 hover:shadow-xl hover:shadow-navy-900/5 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center bg-navy-50 text-navy-700 group-hover:bg-tan-500 group-hover:text-white transition-colors">
                  <Icon />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold uppercase tracking-wider text-navy-900">
                  {t(`home.expect.items.${item.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-700/80">
                  {t(`home.expect.items.${item.key}.body`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* ============================================================ STATS strip */}
      <Section variant="gradient" padding="md">
        <BrandPattern opacity={0.15} />
        <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
          <Stat to={20} suffix="+" label={t('home.stats.years')} />
          <Stat to={2} label={t('home.stats.languages')} />
          <Stat to={15} suffix="+" label={t('home.stats.groups')} />
          <Stat to={25} suffix="+" label={t('home.stats.ministries')} />
        </div>
      </Section>

      {/* ============================================================ LEADERSHIP PREVIEW */}
      <Section variant="cream" padding="lg">
        <SectionHeading
          eyebrow={t('home.leadershipPreview.eyebrow')}
          title={t('home.leadershipPreview.title')}
        />
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {previewLeaders.map((leader, i) => {
            const name = language === 'uk' ? leader.name_uk : leader.name_en;
            const title = language === 'uk' ? leader.title_uk : leader.title_en;
            return (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:shadow-navy-900/10 transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-navy-50">
                  <img
                    src={leaderPhotoUrl(leader.photo_path)}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-navy-900">{name}</h3>
                  <p className="mt-1 text-sm text-tan-500 font-semibold uppercase tracking-wider">{title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Button to={localized('/leadership')} variant="secondary">
            {t('home.leadershipPreview.cta')} →
          </Button>
        </div>
      </Section>

      {/* ============================================================ GROUPS CTA */}
      <Section variant="white" padding="lg">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20 items-center">
          <div className="relative order-2 md:order-1">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={stockPhotos.fellowship.src(1200)} alt={stockPhotos.fellowship.alt} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -top-6 -left-6 hidden md:block w-32 h-32 border-4 border-tan-500" />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-xs font-bold uppercase tracking-widest text-tan-500">{t('home.groupsCta.eyebrow')}</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold uppercase leading-tight text-navy-900">
              {t('home.groupsCta.title')}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-700/85">{t('home.groupsCta.body')}</p>
            <div className="mt-8">
              <Button href="https://churchofnewhope.churchcenter.com/groups">
                {t('home.groupsCta.button')} →
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ GIVE CTA — compact strip */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <img
          src={stockPhotos.charlotte.src(2000)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/90 to-navy-900/60" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-tan-500">
                {t('home.giveCta.eyebrow')}
              </p>
              <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold uppercase leading-tight">
                {t('home.giveCta.title')}
              </h2>
              <p className="mt-3 text-base text-white/75 max-w-xl">{t('home.giveCta.body')}</p>
            </div>
            <Button to={localized('/give')} variant="primary" size="lg">
              {t('home.giveCta.button')} →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// =============================================================================
// Animated stat component — counts up from 0 when scrolled into view
// =============================================================================
const Stat: React.FC<{ to: number; suffix?: string; label: string }> = ({
  to,
  suffix = '',
  label,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500; // ms
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for a nice deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * to));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <div ref={ref}>
      <div className="font-display text-4xl md:text-6xl font-bold text-tan-500 tabular-nums">
        {value}
        {suffix}
      </div>
      <div className="mt-2 text-xs md:text-sm uppercase tracking-widest text-white/70">{label}</div>
    </div>
  );
};

// =============================================================================
// Inline icon set (no external deps, brand-consistent stroke)
// =============================================================================
const iconProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const WorshipIcon = () => (
  <svg {...iconProps}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const TeachingIcon = () => (
  <svg {...iconProps}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const KidsIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="17" cy="9" r="3" />
    <path d="M22 21v-1a3 3 0 0 0-3-3h-1" />
  </svg>
);
const FellowshipIcon = () => (
  <svg {...iconProps}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

export default Home;
