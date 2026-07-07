import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSermons } from '../data/useSermons';
import { useContactInfo } from '../data/useContactInfo';
import { sermonThumbnail } from '../lib/sermonThumbnail';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

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
 * Local sample sermons shown when the database has none yet.
 * Used for previews/presentations — thumbnails are free Unsplash stock photos.
 */
function getSampleSermons(language: 'en' | 'uk', channelUrl: string): SermonItem[] {
  const uk = language === 'uk';
  const url = channelUrl || '#';
  return [
    {
      id: 'sample-1',
      title: uk ? 'Серце поклоніння' : 'The Heart of Worship',
      description: uk
        ? 'Що означає поклонятися Богові в дусі та істині кожного дня нашого життя.'
        : 'What it means to worship God in spirit and truth in every part of our daily lives.',
      series: uk ? 'Основи віри' : 'Faith Foundations',
      speaker: uk ? 'Пастор Юрій Рудницький' : 'Pastor Yuriy Rudnitsky',
      date: '2026-05-31',
      thumb: stockPhotos.worshipHands.src(800),
      url,
    },
    {
      id: 'sample-2',
      title: uk ? 'Ходити вірою' : 'Walking by Faith',
      description: uk
        ? 'Як довіряти Богові й робити кроки віри, навіть коли не бачимо всього шляху.'
        : 'Learning to trust God and take steps of faith even when we can’t see the whole path.',
      series: uk ? 'Основи віри' : 'Faith Foundations',
      speaker: uk ? 'Пастор Юрій Рудницький' : 'Pastor Yuriy Rudnitsky',
      date: '2026-05-24',
      thumb: stockPhotos.openBible.src(800),
      url,
    },
    {
      id: 'sample-3',
      title: uk ? 'Сила молитви' : 'The Power of Prayer',
      description: uk
        ? 'Відкриваємо, як молитва змінює серця, обставини і наближає нас до Бога.'
        : 'Discovering how prayer changes hearts, circumstances, and draws us close to God.',
      series: uk ? 'Життя в Дусі' : 'Life in the Spirit',
      speaker: uk ? 'Пастор Олександр' : 'Pastor Alex',
      date: '2026-05-17',
      thumb: stockPhotos.prayer.src(800),
      url,
    },
    {
      id: 'sample-4',
      title: uk ? 'Жити щедро' : 'Living Generously',
      description: uk
        ? 'Як щедрість стає природним відображенням Божої благодаті в нашому житті.'
        : 'How generosity becomes a natural reflection of God’s grace at work in our lives.',
      series: uk ? 'Життя в Дусі' : 'Life in the Spirit',
      speaker: uk ? 'Пастор Олександр' : 'Pastor Alex',
      date: '2026-05-10',
      thumb: stockPhotos.cross.src(800),
      url,
    },
    {
      id: 'sample-5',
      title: uk ? 'Надія, що тримає' : 'Hope That Anchors',
      description: uk
        ? 'У будь-яких бурях життя ми маємо надію, що міцно тримає нашу душу.'
        : 'In every storm of life we have a hope that holds our soul firm and secure.',
      series: uk ? 'Надія та зцілення' : 'Hope & Healing',
      speaker: uk ? 'Пастор Юрій Рудницький' : 'Pastor Yuriy Rudnitsky',
      date: '2026-05-03',
      thumb: stockPhotos.welcome.src(800),
      url,
    },
    {
      id: 'sample-6',
      title: uk ? 'Божа сім’я' : 'The Family of God',
      description: uk
        ? 'Чому ми створені для спільноти й що означає бути частиною Божої родини.'
        : 'Why we are made for community and what it means to belong to the family of God.',
      series: uk ? 'Надія та зцілення' : 'Hope & Healing',
      speaker: uk ? 'Пастор Олександр' : 'Pastor Alex',
      date: '2026-04-26',
      thumb: stockPhotos.community.src(800),
      url,
    },
  ];
}

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

  const usingSamples = !loading && sermons.length === 0;

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

  const items = usingSamples
    ? getSampleSermons(language, contact.youtube_url)
    : dbItems;

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
        image={stockPhotos.openBible.src(2000)}
        eyebrow={t('sermons.hero.eyebrow')}
        scriptAccent={t('sermons.hero.script')}
        title={t('sermons.hero.title')}
        description={t('sermons.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
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
            <select
              value={seriesFilter}
              onChange={(e) => {
                setSeriesFilter(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="border border-navy-900/15 bg-white px-4 py-4 text-sm text-navy-700 focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
            >
              <option value="">All series</option>
              {uniqueSeries.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <p className="text-center text-navy-700/60">Loading…</p>
        ) : filtered.length === 0 ? (
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
      </Section>
    </div>
  );
};

export default Sermons;
