import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { churchPhotos } from '../data/churchPhotos';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const CHURCH_CENTER_ORIGIN = 'https://churchofnewhope.churchcenter.com';

/** Heights below this are the embed's pre-load placeholder, not its content. */
const MIN_REPORTED_HEIGHT = 150;

/** When (ms after each page load inside the embed) to make it re-measure itself. */
const REMEASURE_DELAYS = [1000, 2500, 5000, 8000];

/**
 * Church Center posts `{"pageHeight": N}` to the parent page whenever the embed's window
 * is resized, and `{"type": "load"}` when a page inside the embed finishes loading
 * (including navigation to an event). Returns the latest real height (null until one
 * arrives) and a counter of page loads.
 */
function useChurchCenterEmbed(): { height: number | null; loads: number } {
  const [height, setHeight] = useState<number | null>(null);
  const [loads, setLoads] = useState(0);
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
      const msg = data as { pageHeight?: unknown; type?: unknown } | null;
      if (typeof msg?.pageHeight === 'number' && msg.pageHeight >= MIN_REPORTED_HEIGHT) {
        setHeight(Math.ceil(msg.pageHeight));
      }
      if (msg?.type === 'load') setLoads((n) => n + 1);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return { height, loads };
}

const Events: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [shrink, setShrink] = useState(false);
  const { height: contentHeight, loads } = useChurchCenterEmbed();

  // The embed reports its height only when its window is resized, and shows a placeholder
  // until its events load. So after the iframe loads, and after every page load inside it,
  // shrink it by 1px for a moment a few times to make it re-measure; the latest report wins.
  useEffect(() => {
    if (loading) return;
    const timers = REMEASURE_DELAYS.flatMap((delay) => [
      window.setTimeout(() => setShrink(true), delay),
      window.setTimeout(() => setShrink(false), delay + 300),
    ]);
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [loading, loads]);

  const fallbackHeight = shrink ? 'h-[599px] md:h-[749px]' : 'h-[600px] md:h-[750px]';

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
              style={contentHeight === null ? undefined : { height: contentHeight - (shrink ? 1 : 0) }}
              className={`${contentHeight === null ? fallbackHeight : ''} block w-full bg-white transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Events;
