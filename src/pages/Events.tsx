import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const Events: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.worship.src(2000)}
        eyebrow={t('events.hero.eyebrow')}
        scriptAccent={t('events.hero.script')}
        title={t('events.hero.title')}
        description={t('events.hero.description')}
        height="short"
      />
      <Section variant="cream" padding="lg">
        <div className="bg-white border border-navy-900/10 p-4 md:p-6 shadow-sm">
          <div className="relative min-h-[600px] md:min-h-[750px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy-900/10 border-t-tan-500" />
              </div>
            )}
            <iframe
              src="https://churchofnewhope.churchcenter.com/calendar?embed=true&view=gallery"
              title="Church of New Hope Events Calendar"
              frameBorder={0}
              allowFullScreen
              onLoad={() => setLoading(false)}
              className={`h-[600px] md:h-[750px] w-full bg-white transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Events;
