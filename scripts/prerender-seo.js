/* eslint-disable */
// Runs after `react-scripts build` (see "build" in package.json).
//
// Link previews (Telegram, Viber, WhatsApp, Facebook, iMessage…) and most crawlers read only
// the HTML the server sends; they never run the app's JavaScript. So for every page in
// src/seo/pages.json this writes a copy of build/index.html with that page's title,
// description, canonical and hreflang links and share-preview (Open Graph) tags, and routes
// the page's URL to its copy in build/_redirects. It also writes build/sitemap.xml.
// In the browser, src/seo/RouteSeo.tsx keeps the same tags in step as the visitor navigates.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const OUT_DIR = '_seo';
const REWRITES_MARKER = '# @prerendered-pages';
const LANGS = ['en', 'uk'];

const seo = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/seo/pages.json'), 'utf8'));

// Structured data for Google (knowledge panel, site name in results). It mirrors
// admin → Contact info; update it here if the address, phone or socials change.
const church = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      // Church is a place in schema.org; Organization adds the logo, email and "publisher" role
      '@type': ['Church', 'Organization'],
      '@id': `${seo.siteUrl}/#church`,
      name: seo.siteName.en,
      alternateName: seo.siteName.uk,
      url: `${seo.siteUrl}/`,
      logo: `${seo.siteUrl}/favicon/android-chrome-512x512.png`,
      image: `${seo.siteUrl}${seo.pages[''].image}`,
      telephone: '+1-704-609-7110',
      email: 'info@churchofnewhope.org',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '13601 Idlewild Rd',
        addressLocality: 'Matthews',
        addressRegion: 'NC',
        postalCode: '28105',
        addressCountry: 'US',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 35.1386659, longitude: -80.6753908 },
      sameAs: [
        'https://www.facebook.com/CNHCharlotte',
        'https://www.instagram.com/newhope.clt/',
        'https://www.youtube.com/@ChurchOfNewHopeUA',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${seo.siteUrl}/#website`,
      name: seo.siteName.en,
      alternateName: ['New Hope', seo.siteName.uk],
      url: `${seo.siteUrl}/`,
      inLanguage: LANGS,
      publisher: { '@id': `${seo.siteUrl}/#church` },
    },
  ],
};

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pagePath = (lang, page) => `/${lang}${page ? `/${page}` : ''}`;
const pageUrl = (lang, page) => seo.siteUrl + pagePath(lang, page);
const pageFile = (lang, page) => `/${OUT_DIR}/${lang}${page ? `-${page}` : ''}.html`;

// The tags this script owns: removed from the template, then written fresh for each page.
const OWNED_TAGS = [
  /<title>[^<]*<\/title>/g,
  /<meta name="description"[^>]*>/g,
  /<meta (?:property|name)="(?:og|twitter):[^"]*"[^>]*>/g,
  /<link rel="(?:canonical|alternate)"[^>]*>/g,
];

// `fallback`: for build/index.html, which also answers URLs that aren't prerendered (a
// ministry's page, admin): the English home page's texts but no URL-specific tags.
function headTags(lang, page, { fallback = false } = {}) {
  const entry = seo.pages[page];
  const { title, description } = entry[lang];
  const url = pageUrl(lang, page);
  const urlTags = [
    `<link rel="canonical" href="${url}"/>`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${pageUrl(l, page)}"/>`),
    `<link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}"/>`,
    `<meta property="og:url" content="${url}"/>`,
  ];
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}"/>`,
    ...(fallback ? [] : urlTags),
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:site_name" content="${escapeHtml(seo.siteName[lang])}"/>`,
    `<meta property="og:title" content="${escapeHtml(title)}"/>`,
    `<meta property="og:description" content="${escapeHtml(description)}"/>`,
    `<meta property="og:image" content="${seo.siteUrl}${entry.image}"/>`,
    `<meta property="og:image:width" content="1200"/>`,
    `<meta property="og:image:height" content="630"/>`,
    `<meta property="og:locale" content="${seo.locale[lang]}"/>`,
    ...LANGS.filter((l) => l !== lang).map(
      (l) => `<meta property="og:locale:alternate" content="${seo.locale[l]}"/>`
    ),
    `<meta name="twitter:card" content="summary_large_image"/>`,
  ];
  if (page === '' && !fallback) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(church)}</script>`);
  }
  return tags.join('');
}

function fail(message) {
  console.error(`prerender-seo: ${message}`);
  process.exit(1);
}

const template = fs.readFileSync(path.join(BUILD, 'index.html'), 'utf8');
if (!template.includes('</head>')) fail('build/index.html has no </head>');
if (!/<html lang="[^"]*"/.test(template)) fail('build/index.html has no <html lang="…">');
const bare = OWNED_TAGS.reduce((html, re) => html.replace(re, ''), template);
// A tag written in a form the patterns miss would end up twice on every page.
const leftover = bare.match(/<title|name="description"|(?:property|name)="(?:og|twitter):|rel="(?:canonical|alternate)"/);
if (leftover) fail(`public/index.html has a "${leftover[0]}" tag this script can't replace`);

const render = (lang, page, options) =>
  bare
    .replace(/<html lang="[^"]*"/, () => `<html lang="${lang}"`)
    .replace('</head>', () => `${headTags(lang, page, options)}</head>`);

fs.mkdirSync(path.join(BUILD, OUT_DIR), { recursive: true });
const pages = Object.keys(seo.pages);
const rewrites = [];
for (const lang of LANGS) {
  for (const page of pages) {
    fs.writeFileSync(path.join(BUILD, pageFile(lang, page)), render(lang, page));
    rewrites.push(`${pagePath(lang, page).padEnd(20)} ${pageFile(lang, page).padEnd(28)} 200`);
  }
}
// A link without the language (/give) goes to the English page on the server, so its
// preview is that page's and not the home page's.
for (const page of pages.filter(Boolean)) {
  rewrites.push(`${`/${page}`.padEnd(20)} ${pagePath('en', page).padEnd(28)} 301`);
}
fs.writeFileSync(path.join(BUILD, 'index.html'), render('en', '', { fallback: true }));

// Serve each page's copy in place of the SPA fallback (the rules must come before it).
const redirectsFile = path.join(BUILD, '_redirects');
const redirects = fs.readFileSync(redirectsFile, 'utf8');
if (!redirects.includes(REWRITES_MARKER)) fail(`no "${REWRITES_MARKER}" line in public/_redirects`);
fs.writeFileSync(redirectsFile, redirects.replace(REWRITES_MARKER, () => rewrites.join('\n')));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...LANGS.flatMap((lang) => pages.map((page) => `  <url><loc>${pageUrl(lang, page)}</loc></url>`)),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap);

console.log(`prerender-seo: ${LANGS.length * pages.length} pages, sitemap.xml`);
