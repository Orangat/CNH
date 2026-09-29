import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seo from './pages.json';

/**
 * Keeps the tab title, page language, description and canonical/hreflang links in step with
 * the route as the visitor navigates. The first load already has the right tags, including
 * the share-preview ones: scripts/prerender-seo.js writes them into a copy of index.html for
 * every page in pages.json, because link previews and most crawlers don't run JavaScript.
 */

type Lang = keyof typeof seo.siteName;
type PageKey = keyof typeof seo.pages;

const LANGS = Object.keys(seo.siteName) as Lang[];

function setMeta(name: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLinks(rel: 'canonical' | 'alternate', links: { href: string; hreflang?: string }[]) {
  document.head.querySelectorAll(`link[rel="${rel}"]`).forEach((el) => el.remove());
  for (const { href, hreflang } of links) {
    const el = document.createElement('link');
    el.rel = rel;
    el.href = href;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
}

function applySeo(pathname: string) {
  if (/^\/admin(\/|$)/.test(pathname)) {
    document.title = `Admin | ${seo.siteName.en}`;
    setMeta('robots', 'noindex');
    setLinks('canonical', []);
    setLinks('alternate', []);
    return;
  }

  const [lang, page = '', ...rest] = pathname.split('/').filter(Boolean);
  const known =
    LANGS.includes(lang as Lang) && Object.prototype.hasOwnProperty.call(seo.pages, page);
  if (!known) return; // not a page: the router redirects it

  const { title, description } = seo.pages[page as PageKey][lang as Lang];
  // A sub-page (a ministry's own page) uses its section's texts under its own URL.
  const subpath = [page, ...rest].filter(Boolean).join('/');
  const urlFor = (l: string) => `${seo.siteUrl}/${l}${subpath ? `/${subpath}` : ''}`;

  document.documentElement.lang = lang;
  document.title = title;
  setMeta('description', description);
  setMeta('robots', null);
  setLinks('canonical', [{ href: urlFor(lang) }]);
  setLinks('alternate', [
    ...LANGS.map((l) => ({ href: urlFor(l), hreflang: l })),
    { href: urlFor('en'), hreflang: 'x-default' },
  ]);
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => applySeo(pathname), [pathname]);
  return null;
}
