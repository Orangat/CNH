import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSermons } from '../data/useSermons';
import { useContactInfo } from '../data/useContactInfo';
import { sermonThumbnail } from '../lib/sermonThumbnail';
import { churchPhotos } from '../data/churchPhotos';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';
import Button from '../components/redesign/Button';

const PAGE_SIZE = 12;

interface SermonItem {
  id: string;
  title: string;
  description?: string;
  series?: string;
  speaker?: string;
  date?: string;
  thumb: string;
  url: string;
}

/**
 * Shown while the database has no sermons yet: a single block that sends
 * visitors to the church's YouTube channel instead of placeholder sermons.
 */
const YouTubeChannel: React.FC<{ url: string }> = ({ url }) => {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto grid max-w-5xl overflow-hidden border border-navy-900/10 bg-white md:grid-cols-2"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-video overflow-hidden bg-navy-900 md:aspect-auto md:min-h-[340px]"
      >
        <img
          src={churchPhotos.sermonVideo.src()}
          alt={churchPhotos.sermonVideo.alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/30 group-hover:bg-navy-900/10 transition-colors">
          <div className="flex h-16 w-16 items-center justify-center bg-tan-500/95 text-navy-900 group-hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </a>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-tan-500">{t('sermons.youtube.eyebrow')}</p>
        <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold uppercase leading-tight text-navy-900">
          {t('sermons.youtube.title')}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-navy-700/85">{t('sermons.youtube.body')}</p>
        <div className="mt-8">
          <Button href={url} target="_blank" rel="noopener noreferrer" variant="secondary">
            {t('sermons.watchOn')} →
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const SermonCard: React.FC<{ item: SermonItem; index: number; language: 'en' | 'uk' }> = ({
  item,
  index,
  language,
}) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    className="group bg-white border border-navy-900/10 hover:shadow-2xl hover:shadow-navy-900/10 transition-shadow"
  >
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
      <div className="aspect-video overflow-hidden bg-navy-900 relative">
        <img
          src={item.thumb}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/30 group-hover:bg-navy-900/10 transition-colors">
          <div className="flex h-16 w-16 items-center justify-center bg-tan-500/95 text-navy-900 group-hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-6">
        {item.series && (
          <p className="text-xs font-bold uppercase tracking-widest text-tan-500">{item.series}</p>
        )}
        <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wider text-navy-900 leading-tight">
          {item.title}
        </h3>
        <div className="mt-3 flex items-center gap-3 text-xs text-navy-700/60">
          {item.speaker && <span>{item.speaker}</span>}
          {item.date && (
            <>
              <span>·</span>
              <span>
                {new Date(item.date).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </>
          )}
        </div>
        {item.description && (
          <p className="mt-4 line-clamp-3 text-sm text-navy-700/80 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </a>
  </motion.article>
);

const Sermons: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: sermons, loading } = useSermons();
  const { data: contact } = useContactInfo();
  const [filter, setFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const dbItems: SermonItem[] = useMemo(
    () =>
      sermons.map((s) => ({
        id: s.id,
        title: language === 'uk' && s.title_uk ? s.title_uk : s.title_en,
        description:
          language === 'uk' && s.description_uk ? s.description_uk : s.description_en || undefined,
        series: s.series || undefined,
        speaker: s.speaker || undefined,
        date: s.preached_at || undefined,
        thumb: sermonThumbnail(s),
        url: `https://www.youtube.com/watch?v=${s.youtube_id}`,
      })),
    [sermons, language],
  );

  const items = dbItems;

  const uniqueSeries = useMemo(() => {
    const set = new Set(items.map((s) => s.series).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (seriesFilter) {
      result = result.filter((s) => s.series === seriesFilter);
    }
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter((s) =>
        [s.title, s.speaker, s.series, s.description].some((v) =>
          (v || '').toLowerCase().includes(f),
        ),
      );
    }
    return result;
  }, [items, filter, seriesFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bg-cream">
      <Hero
        image={churchPhotos.preaching.src()}
        eyebrow={t('sermons.hero.eyebrow')}
        scriptAccent={t('sermons.hero.script')}
        title={t('sermons.hero.title')}
        description={t('sermons.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        {loading ? (
          <p className="text-center text-navy-700/60">Loading…</p>
        ) : sermons.length === 0 ? (
          <YouTubeChannel url={contact.youtube_url} />
        ) : (
          <>
            {/* Filters */}
            <div className="mx-auto mb-12 max-w-xl flex flex-col sm:flex-row gap-3">
              <input
                type="search"
                placeholder="Search by title, speaker, series…"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="flex-1 border border-navy-900/15 bg-white px-5 py-4 text-sm placeholder:text-navy-700/40 focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
              />
              {uniqueSeries.length >= 3 && (
                <div className="relative">
                  {/* Native arrow is hidden (appearance-none): Chrome pins it to the border, ignoring padding */}
                  <select
                    value={seriesFilter}
                    onChange={(e) => {
                      setSeriesFilter(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className="w-full appearance-none border border-navy-900/15 bg-white py-4 pl-4 pr-11 text-sm text-navy-700 focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
                  >
                    <option value="">All series</option>
                    {uniqueSeries.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700"
                  >
                    <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-navy-700/60">{t('sermons.empty')}</p>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {visible.map((item, i) => (
                    <SermonCard key={item.id} item={item} index={i} language={language} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="bg-navy-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-navy-800 transition-colors cursor-pointer"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Section>
    </div>
  );
};

export default Sermons;
