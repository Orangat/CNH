import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useMinistry } from '../data/useMinistries';
import { ministryPhotoUrl } from '../lib/supabase';
import { pickLang } from '../utils/pickLang';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';
import { Lightbox } from '../components/redesign/Lightbox';

const SERVE_TEAM_FORM = 'https://churchofnewhope.churchcenter.com/people/forms/922679';

const MinistryDetail: React.FC = () => {
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const { data: m, loading } = useMinistry(slug ?? '');
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-cream">
        <Section variant="cream" padding="lg">
          <p className="text-center text-navy-700/60">Loading…</p>
        </Section>
      </div>
    );
  }

  // Detail pages exist only for published flagship ministries.
  if (!m || !m.is_featured) return <Navigate to={`/v2/${language}/ministries`} replace />;

  const name = pickLang(language, m.name_en, m.name_uk);
  const audience = pickLang(language, m.audience_en ?? '', m.audience_uk ?? '');
  const meeting = pickLang(language, m.meeting_info_en, m.meeting_info_uk);
  const location = pickLang(language, m.location_en ?? '', m.location_uk ?? '');
  const shortDesc = pickLang(language, m.description_en, m.description_uk);
  const longDesc = pickLang(language, m.long_description_en ?? '', m.long_description_uk ?? '');
  const leaderRole = pickLang(language, m.leader_role_en ?? '', m.leader_role_uk ?? '');
  const ctaUrl = m.cta_url || SERVE_TEAM_FORM;
  const ctaLabel = pickLang(language, m.cta_label_en ?? '', m.cta_label_uk ?? '') || (language === 'uk' ? 'Мені цікаво' : "I'm interested");
  const galleryUrls = (m.gallery ?? []).map((p) => ministryPhotoUrl(p));

  const uk = language === 'uk';

  return (
    <div className="bg-cream">
      <Hero
        image={m.photo_path ? ministryPhotoUrl(m.photo_path) : undefined}
        eyebrow={audience || undefined}
        title={name}
        description={shortDesc || undefined}
        height="short"
      />

      <Section variant="cream" padding="lg">
        <div className="mx-auto max-w-3xl">
          <Link
            to={`/v2/${language}/ministries`}
            className="text-xs font-bold uppercase tracking-widest text-tan-600 hover:text-tan-500 transition-colors"
          >
            ← {uk ? 'Усі служіння' : 'All ministries'}
          </Link>

          {(meeting || location) && (
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs uppercase tracking-wider text-navy-700/70">
              {meeting && <span><span className="font-bold text-navy-900">{uk ? 'Збори' : 'Meets'}:</span> {meeting}</span>}
              {location && <span><span className="font-bold text-navy-900">{uk ? 'Місце' : 'Location'}:</span> {location}</span>}
            </div>
          )}

          {longDesc && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-navy-700/90">{longDesc}</p>
          )}

          {(m.leader_name || leaderRole) && (
            <div className="mt-8 border-l-2 border-tan-500 pl-4">
              {m.leader_name && (
                <p className="font-display text-lg font-bold uppercase tracking-wider text-navy-900">{m.leader_name}</p>
              )}
              {leaderRole && <p className="text-xs uppercase tracking-wider text-navy-700/60">{leaderRole}</p>}
            </div>
          )}

          <div>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 bg-tan-500 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-tan-600 transition-colors"
            >
              {ctaLabel} →
            </a>
          </div>
        </div>

        {galleryUrls.length > 0 && (
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {galleryUrls.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="group relative aspect-[4/3] overflow-hidden"
                  aria-label={`Open photo ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox images={galleryUrls} index={lightbox} caption={name} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MinistryDetail;
