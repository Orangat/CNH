import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSermons } from '../data/useSermons';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const Sermons: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: sermons, loading } = useSermons();
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter) return sermons;
    const f = filter.toLowerCase();
    return sermons.filter((s) =>
      [s.title_en, s.title_uk, s.speaker, s.series, s.scripture]
        .some((v) => v.toLowerCase().includes(f))
    );
  }, [sermons, filter]);

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
        {/* Filter */}
        <div className="mx-auto mb-12 max-w-xl">
          <input
            type="search"
            placeholder="Search by title, speaker, series…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border border-navy-900/15 bg-white px-5 py-4 text-sm placeholder:text-navy-700/40 focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
          />
        </div>

        {loading ? (
          <p className="text-center text-navy-700/60">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-navy-700/60">{t('sermons.empty')}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sermon, i) => {
              const title = language === 'uk' && sermon.title_uk ? sermon.title_uk : sermon.title_en;
              const description = language === 'uk' && sermon.description_uk
                ? sermon.description_uk
                : sermon.description_en;
              return (
                <motion.article
                  key={sermon.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="group bg-white border border-navy-900/10 hover:shadow-2xl hover:shadow-navy-900/10 transition-shadow"
                >
                  <a
                    href={`https://www.youtube.com/watch?v=${sermon.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="aspect-video overflow-hidden bg-navy-900 relative">
                      <img
                        src={`https://i.ytimg.com/vi/${sermon.youtube_id}/hqdefault.jpg`}
                        alt={title}
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
                      {sermon.series && (
                        <p className="text-xs font-bold uppercase tracking-widest text-tan-500">
                          {sermon.series}
                        </p>
                      )}
                      <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wider text-navy-900 leading-tight">
                        {title}
                      </h3>
                      <div className="mt-3 flex items-center gap-3 text-xs text-navy-700/60">
                        {sermon.speaker && <span>{sermon.speaker}</span>}
                        {sermon.preached_at && (
                          <>
                            <span>·</span>
                            <span>{new Date(sermon.preached_at).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </>
                        )}
                      </div>
                      {description && (
                        <p className="mt-4 line-clamp-3 text-sm text-navy-700/80 leading-relaxed">
                          {description}
                        </p>
                      )}
                    </div>
                  </a>
                </motion.article>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
};

export default Sermons;
