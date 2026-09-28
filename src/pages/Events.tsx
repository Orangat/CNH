import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { churchPhotos } from '../data/churchPhotos';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const CHURCH_CENTER_ORIGIN = 'https://churchofnewhope.churchcenter.com';

/** Heights below this are the embed's pre-load placeholder, not its content. */
const MIN_REPORTED_HEIGHT = 150;

/**
 * Church Center posts `{"pageHeight": N}` to the parent page whenever the embed's window
 * is resized. Returns the latest reported height, or null until a real one arrives.
 */
function useChurchCenterHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== CHURCH_CENTER_ORIGIN) return;
      let data: unknown = e.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const reported = (data as { pageHeight?: unknown } | null)?.pageHeight;
      if (typeof reported === 'number' && reported >= MIN_REPORTED_HEIGHT) {
        setHeight(Math.ceil(reported));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return height;
}

const Events: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [nudges, setNudges] = useState(0);
  const contentHeight = useChurchCenterHeight();

  // The embed only reports its height when its window is resized, and reports a
  // placeholder height until its events have loaded. So after it loads, keep changing
  // its height by 1px (a few times, ~1s apart) until a real height arrives and takes over.
  useEffect(() => {
    if (loading || contentHeight !== null || nudges >= 8) return;
    const timer = window.setTimeout(() => setNudges((n) => n + 1), 1200);
    return () => window.clearTimeout(timer);
  }, [loading, contentHeight, nudges]);

  const fallbackHeight = nudges % 2 ? 'h-[599px] md:h-[749px]' : 'h-[600px] md:h-[750px]';

  return (
    <div className="bg-cream">
      <Hero
        image={churchPhotos.summerPicnic.src()}
        eyebrow={t('events.hero.eyebrow')}
        scriptAccent={t('events.hero.script')}
        title={t('events.hero.title')}
        description={t('events.hero.description')}
        height="short"
      />
      <Section variant="cream" padding="lg">
        <div className="bg-white border border-navy-900/10 p-4 md:p-6 shadow-sm">
          <div className={`relative ${contentHeight === null ? 'min-h-[600px] md:min-h-[750px]' : ''}`}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy-900/10 border-t-tan-500" />
              </div>
            )}
            <iframe
              src={`${CHURCH_CENTER_ORIGIN}/calendar?embed=true&view=gallery`}
              title="Church of New Hope Events Calendar"
              frameBorder={0}
              allowFullScreen
              onLoad={() => setLoading(false)}
              style={contentHeight === null ? undefined : { height: contentHeight }}
              className={`${contentHeight === null ? fallbackHeight : ''} block w-full bg-white transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Events;
