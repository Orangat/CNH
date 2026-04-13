import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface NavItem {
  labelKey: string;
  to?: string;
  href?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    labelKey: 'nav.aboutUs',
    children: [
      { labelKey: 'nav.weBelieve', to: '/we-believe' },
      { labelKey: 'nav.ourLeadership', to: '/leadership' },
      { labelKey: 'nav.ministries', to: '/ministries' },
    ],
  },
  { labelKey: 'nav.sermons', to: '/sermons' },
  { labelKey: 'nav.events', to: '/events' },
  { labelKey: 'nav.groups', href: 'https://churchofnewhope.churchcenter.com/groups' },
  { labelKey: 'nav.prayer', to: '/prayer' },
  { labelKey: 'nav.give', to: '/give' },
];

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [location.pathname]);

  const localized = (path: string) => `/v2/${lang || language}${path}`;

  const transparent = !scrolled && !mobileOpen;

  const headerClass = `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
    transparent
      ? 'bg-transparent py-4'
      : 'bg-navy-900/95 backdrop-blur-md py-2 shadow-lg shadow-navy-900/20'
  }`;

  return (
    <>
      <header className={headerClass}>
        <div className="mx-auto flex max-w-8xl items-center justify-between px-6 md:px-10">
          {/* Logo */}
          <Link
            to={localized('')}
            className="flex items-center transition-opacity hover:opacity-80"
            aria-label="Church of New Hope"
          >
            <img
              src="/logo.png"
              alt="Church of New Hope"
              className={`transition-all duration-300 ${transparent ? 'h-14 md:h-16' : 'h-12 md:h-14 brightness-0 invert'}`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <NavItemDesktop
                key={item.labelKey}
                item={item}
                t={t}
                localized={localized}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            ))}
            <div className="ml-4 flex items-center gap-2 border-l border-white/20 pl-4">
              <LangBtn active={language === 'en'} onClick={() => setLanguage('en')}>EN</LangBtn>
              <span className="text-white/30">/</span>
              <LangBtn active={language === 'uk'} onClick={() => setLanguage('uk')}>UA</LangBtn>
            </div>
            <Link
              to={localized('/visit')}
              className="ml-4 inline-flex items-center justify-center rounded-none bg-tan-500 px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy-900 transition-all hover:bg-tan-600 hover:text-white cursor-pointer"
            >
              {t('nav.planVisit')}
            </Link>
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-12 w-12 items-center justify-center rounded text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>


      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[60] bg-cream lg:hidden overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-900/10 bg-cream px-6 py-4">
              <Link to={localized('')} onClick={() => setMobileOpen(false)}>
                <img src="/logo.png" alt="Church of New Hope" className="h-14" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-12 w-12 items-center justify-center text-navy-900 hover:bg-navy-900/5 cursor-pointer"
                aria-label="Close menu"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="px-6 py-6">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.labelKey}
                  item={item}
                  t={t}
                  localized={localized}
                  expanded={mobileExpanded === item.labelKey}
                  onToggle={() =>
                    setMobileExpanded(mobileExpanded === item.labelKey ? null : item.labelKey)
                  }
                  onClose={() => setMobileOpen(false)}
                />
              ))}

              <div className="mt-8 border-t border-navy-900/10 pt-6">
                <Link
                  to={localized('/visit')}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full bg-tan-500 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-navy-900 hover:bg-tan-600 hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.planVisit')}
                </Link>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <LangBtn dark active={language === 'en'} onClick={() => setLanguage('en')}>EN</LangBtn>
                  <span className="text-navy-900/30">/</span>
                  <LangBtn dark active={language === 'uk'} onClick={() => setLanguage('uk')}>UA</LangBtn>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// =============================================================================
// Subcomponents
// =============================================================================

const NavItemDesktop: React.FC<{
  item: NavItem;
  t: (key: string) => string;
  localized: (path: string) => string;
  openDropdown: string | null;
  setOpenDropdown: (k: string | null) => void;
}> = ({ item, t, localized, openDropdown, setOpenDropdown }) => {
  const linkClass =
    'px-3 py-2 text-xs font-bold uppercase tracking-widest text-white hover:text-tan-500 transition-colors cursor-pointer';

  if (item.children) {
    const open = openDropdown === item.labelKey;
    return (
      <div
        className="relative"
        onMouseEnter={() => setOpenDropdown(item.labelKey)}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button type="button" className={`${linkClass} flex items-center gap-1.5`}>
          {t(item.labelKey)}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {/* Invisible bridge so the mouse doesn't leave the hover zone */}
        <div className="absolute left-0 top-full h-3 w-full" />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.92, y: -4 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.92, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 0, backdropFilter: 'blur(12px) saturate(1.4)' }}
              className="absolute left-0 top-full mt-3 min-w-[240px] overflow-hidden border border-white/[0.12] bg-black/25 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.4)]"
            >
              {/* Accent line */}
              <div className="h-[2px] bg-gradient-to-r from-tan-500 via-tan-400 to-transparent" />

              <div className="py-2">
                {item.children.map((c, i) => (
                  <motion.div
                    key={c.labelKey}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
                  >
                    <Link
                      to={localized(c.to!)}
                      className="group flex items-center gap-3 px-5 py-3 transition-all duration-200"
                    >
                      <span className="h-px w-0 bg-tan-500 transition-all duration-300 group-hover:w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 transition-colors duration-200 group-hover:text-white">
                        {t(c.labelKey)}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {t(item.labelKey)}
      </a>
    );
  }
  return (
    <Link to={localized(item.to!)} className={linkClass}>
      {t(item.labelKey)}
    </Link>
  );
};

const MobileNavItem: React.FC<{
  item: NavItem;
  t: (key: string) => string;
  localized: (path: string) => string;
  expanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ item, t, localized, expanded, onToggle, onClose }) => {
  if (item.children) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between py-4 text-left text-2xl font-bold uppercase tracking-wide text-navy-900 cursor-pointer"
        >
          <span>{t(item.labelKey)}</span>
          <span className="text-3xl font-light">{expanded ? '−' : '+'}</span>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-l-2 border-tan-500 pl-4 pb-4">
                {item.children.map((c) => (
                  <Link
                    key={c.labelKey}
                    to={localized(c.to!)}
                    onClick={onClose}
                    className="block py-3 text-lg font-semibold uppercase tracking-wide text-navy-700 hover:text-tan-500 cursor-pointer"
                  >
                    {t(c.labelKey)}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="block py-4 text-2xl font-bold uppercase tracking-wide text-navy-900 cursor-pointer"
      >
        {t(item.labelKey)}
      </a>
    );
  }
  return (
    <Link
      to={localized(item.to!)}
      onClick={onClose}
      className="block py-4 text-2xl font-bold uppercase tracking-wide text-navy-900 cursor-pointer"
    >
      {t(item.labelKey)}
    </Link>
  );
};

const LangBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  dark?: boolean;
  children: React.ReactNode;
}> = ({ active, onClick, dark, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
      dark
        ? active
          ? 'text-navy-900'
          : 'text-navy-900/40 hover:text-navy-900'
        : active
        ? 'text-white'
        : 'text-white/50 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default Header;
