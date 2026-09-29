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
    { key: 'nav.planVisit', to: '/visit' },
    { key: 'nav.events', to: '/events' },
    { key: 'nav.prayer', to: '/prayer' },
    { key: 'nav.give', to: '/give' },
    { key: 'nav.forms', to: '/forms' },
  ];
  const discoverLinks = [
    { key: 'nav.weBelieve', to: '/we-believe' },
    { key: 'nav.ourLeadership', to: '/leadership' },
    { key: 'nav.ministries', to: '/ministries' },
    { key: 'nav.sermons', to: '/sermons' },
  ];

  return (
    <footer>
      {/* ════════════════════════════════════════════ JOIN US — card bridging the page and the footer */}
      {/* A white card on its own cream band, overlapping the navy footer, so it never merges
          with a page's last section (cream or navy). */}
      <section className="join-band bg-cream px-6 md:px-10">
        <div className="relative z-10 mx-auto -mb-24 max-w-6xl border-t-[3px] border-tan-500 bg-white text-navy-900 shadow-[0_32px_64px_-32px_rgba(10,42,70,0.5)] ring-1 ring-navy-900/5 md:-mb-20">
          <div className="grid md:grid-cols-12">
            {/* Invitation */}
            <div className="px-8 py-10 text-center md:col-span-7 md:px-12 md:py-12 md:text-left">
              <p className="font-script text-[26px] leading-none text-tan-500 md:text-4xl">
                {t('footer.banner.eyebrow')}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-tight md:text-4xl">
                {t('footer.banner.title')}
              </h2>
              <a
                href={contact.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-balance text-sm text-navy-700 hover:text-tan-600 transition-colors"
              >
                {/* inline, not a flex item: when the address wraps, the pin stays next to its first word */}
                <i className="fas fa-map-marker-alt mr-2 text-tan-500" aria-hidden="true" />
                {contact.address}
              </a>
              {!isVisitPage && (
                <div className="mt-8">
                  <Link
                    to={localized('/visit')}
                    className="group inline-flex items-center gap-2 bg-navy-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-tan-500 hover:text-navy-900 transition-colors cursor-pointer"
                  >
                    {t('nav.planVisit')}
                    {/* SVG, not "→": the text arrow comes from a fallback font on some phones and sits off-centre */}
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition-transform group-hover:translate-x-1">
                      <path d="M2 8h11M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Service times */}
            <div className="grid grid-cols-2 border-t border-navy-900/10 md:col-span-5 md:border-l md:border-t-0">
              <ServiceCard
                language={t('home.english')}
                day={t('home.sundays')}
                time={contact.service_time_english}
              />
              <ServiceCard
                language={t('home.ukrainian')}
                day={t('home.sundays')}
                time={contact.service_time_ukrainian}
                className="border-l border-navy-900/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ MAIN GRID — navy with brand pattern */}
      <section className="relative overflow-hidden bg-navy-900 pt-24 text-white md:pt-20">
        <BrandPattern opacity={0.3} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 py-14 md:py-16">
          <div className="grid gap-12 md:gap-10 md:grid-cols-12">
            {/* ───── BRAND (4 cols) — text-left explicit, logo wrapped tight */}
            <div className="md:col-span-4 text-left">
              <Link to={localized('')} className="block w-fit">
                <img
                  src="/logo-light.png"
                  alt="Church of New Hope"
                  className="h-14 w-auto"
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
            <div className="md:col-span-4 text-left">
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

const ServiceCard: React.FC<{ language: string; day: string; time: string; className?: string }> = ({
  language,
  day,
  time,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center px-4 py-8 text-center md:py-10 ${className}`}>
    <p className="text-xs font-bold uppercase tracking-widest text-tan-500">{day}</p>
    <p className="mt-3 whitespace-nowrap font-display text-2xl font-bold text-navy-900 sm:text-3xl md:text-4xl">{time}</p>
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
