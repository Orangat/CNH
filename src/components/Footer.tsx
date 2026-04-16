import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useContactInfo } from '../data/useContactInfo';
import BrandPattern from './redesign/BrandPattern';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const currentLang = lang || language;
  const { data: contact } = useContactInfo();
  const telHref = `tel:${contact.phone.replace(/[^+\d]/g, '')}`;
  const localized = (path: string) => `/${currentLang}${path}`;
  const isVisitPage = location.pathname === localized('/visit');

  const connectLinks = [
    { key: 'nav.visit', to: '/visit' },
    { key: 'nav.events', to: '/events' },
    { key: 'nav.prayer', to: '/prayer' },
    { key: 'nav.give', to: '/give' },
  ];
  const discoverLinks = [
    { key: 'nav.weBelieve', to: '/we-believe' },
    { key: 'nav.ourLeadership', to: '/leadership' },
    { key: 'nav.ministries', to: '/ministries' },
    { key: 'nav.sermons', to: '/sermons' },
  ];

  return (
    <footer>
      {/* ════════════════════════════════════════════ TOP BANNER — light cream */}
      <section className="bg-cream text-navy-900">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-14 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-12">
            {/* Left — invitation copy */}
            <div className="md:col-span-5 text-center md:text-left">
              <p className="font-script text-3xl md:text-4xl text-tan-500">
                {t('visit.hero.script')}
              </p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold uppercase leading-tight">
                {t('home.hero.ctaPrimary')}
              </h2>
              <a
                href={contact.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-navy-700 hover:text-tan-500 transition-colors"
              >
                <i className="fas fa-map-marker-alt text-tan-500" />
                {contact.address}
              </a>
              {!isVisitPage && (
                <div className="mt-6">
                  <Link
                    to={localized('/visit')}
                    className="group inline-flex items-center gap-3 bg-navy-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-tan-500 hover:text-navy-900 transition-colors cursor-pointer"
                  >
                    {t('nav.planVisit')}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Right — service times card */}
            <div className="md:col-span-7">
              <div className="grid grid-cols-2 gap-px bg-navy-900/10 border border-navy-900/10">
                <ServiceCard
                  language={t('home.english')}
                  day={t('home.sundays')}
                  time={contact.service_time_english}
                />
                <ServiceCard
                  language={t('home.ukrainian')}
                  day={t('home.sundays')}
                  time={contact.service_time_ukrainian}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ MAIN GRID — navy with pattern */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <BrandPattern opacity={0.1} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-14 md:py-16">
          <div className="grid gap-12 md:gap-10 md:grid-cols-12">
            {/* ───── BRAND (4 cols) — text-left explicit, logo wrapped tight */}
            <div className="md:col-span-4 text-left">
              <Link to={localized('')} className="block w-fit">
                <img
                  src="/logo.png"
                  alt="Church of New Hope"
                  className="h-14 w-auto brightness-0 invert"
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                {t('home.welcome.body')}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <SocialLink href={contact.facebook_url} icon="fab fa-facebook-f" label="Facebook" />
                <SocialLink href={contact.instagram_url} icon="fab fa-instagram" label="Instagram" />
                <SocialLink href={contact.youtube_url} icon="fab fa-youtube" label="YouTube" />
              </div>
            </div>

            {/* ───── CONNECT (2 cols) */}
            <FooterColumn title={t('footer.connect')} className="md:col-span-2">
              {connectLinks.map((l) => (
                <FooterLink key={l.key} to={localized(l.to)}>
                  {t(l.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            {/* ───── DISCOVER (2 cols) */}
            <FooterColumn title={t('footer.explore')} className="md:col-span-2">
              {discoverLinks.map((l) => (
                <FooterLink key={l.key} to={localized(l.to)}>
                  {t(l.key)}
                </FooterLink>
              ))}
              <FooterLink href="https://churchofnewhope.churchcenter.com/groups">
                {t('nav.groups')}
              </FooterLink>
            </FooterColumn>

            {/* ───── CONTACT (4 cols) */}
            <div className="md:col-span-4">
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-tan-500">
                {t('nav.aboutUs')}
              </h4>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt mt-[3px] w-4 text-center text-tan-500" />
                  <a
                    href={contact.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-tan-500 transition-colors"
                  >
                    {contact.address}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-phone mt-[3px] w-4 text-center text-tan-500" />
                  <a href={telHref} className="hover:text-tan-500 transition-colors">
                    {contact.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-envelope mt-[3px] w-4 text-center text-tan-500" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-tan-500 transition-colors break-all"
                  >
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ════════════════════════════════════════════ BOTTOM BAR */}
          <div className="mt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/50">
            <p>{t('footer.copyright')}</p>
            <p className="font-script text-tan-500/70 text-base">{t('footer.tagline')}</p>
            <Link to="/admin" className="text-white/20 hover:text-white/40 transition-colors">Admin</Link>
          </div>
        </div>
      </section>
    </footer>
  );
};

// =============================================================================
// Subcomponents
// =============================================================================

const ServiceCard: React.FC<{ language: string; day: string; time: string }> = ({
  language,
  day,
  time,
}) => (
  <div className="bg-cream px-6 py-8 text-center">
    <p className="text-xs font-bold uppercase tracking-widest text-tan-500">{day}</p>
    <p className="mt-3 font-display text-3xl md:text-4xl font-bold text-navy-900">{time}</p>
    <p className="mt-1 text-sm uppercase tracking-wider text-navy-700/70">{language}</p>
  </div>
);

const FooterColumn: React.FC<{
  title: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, className = '', children }) => (
  <div className={`text-left ${className}`}>
    <h4 className="font-display text-xs font-bold uppercase tracking-widest text-tan-500">
      {title}
    </h4>
    <ul className="mt-6 space-y-3 list-none p-0">{children}</ul>
  </div>
);

const FooterLink: React.FC<{
  to?: string;
  href?: string;
  children: React.ReactNode;
}> = ({ to, href, children }) => {
  const cls =
    'group inline-flex items-center gap-2 text-sm text-white/80 hover:text-tan-500 transition-colors cursor-pointer';
  const arrow = (
    <span className="opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-tan-500">
      →
    </span>
  );
  if (href) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
          {arrow}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link to={to!} className={cls}>
        {children}
        {arrow}
      </Link>
    </li>
  );
};

const SocialLink: React.FC<{ href: string; icon: string; label: string }> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex h-11 w-11 items-center justify-center border border-white/20 text-white hover:border-tan-500 hover:bg-tan-500 hover:text-navy-900 transition-all cursor-pointer"
  >
    <i className={icon} />
  </a>
);

export default Footer;
