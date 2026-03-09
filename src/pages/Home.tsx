import React from 'react';
import UpcomingServices from '../components/UpcompingServices';
import AboutChurchHome from '../components/AboutChurchHome';
import SmallGroups from '../components/SmallGroups';
import GetConnected from '../components/GetConnected';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../contexts/SiteContentContext';


const Home: React.FC = () => {
  const videoUrl = './assets/bg_video.mp4';
  const location = useLocation();
  const { t, language } = useLanguage();
  const { site } = useSiteContent();

  return (

    <div className="Home">
      <UpcomingServices key={location.pathname} videoUrl={videoUrl}>
        <h1 className="overlay-title">{t('home.sundays')}</h1>
        <p>
          {t('home.joinUs')}
          <br /> {site.serviceTimes.english} ({t('home.english')}) <br /> {site.serviceTimes.ukrainian} ({t('home.ukrainian')})
          {site.gameTime.enabled && (site.gameTime.timeEn || site.gameTime.timeUk) ? (
            <>
              <br />
              {(language === 'uk' ? site.gameTime.labelUk : site.gameTime.labelEn) || t('home.game')}:{' '}
              {(language === 'uk' ? site.gameTime.timeUk : site.gameTime.timeEn) || site.gameTime.timeEn || site.gameTime.timeUk}
            </>
          ) : null}
          {site.homeAnnouncement.enabled ? (
            <>
              <br />
              <span style={{ fontWeight: 300, fontSize: '0.9em', opacity: 0.9 }}>
                {t('home.announcement')}: {language === 'uk' ? site.homeAnnouncement.uk : site.homeAnnouncement.en}
              </span>
            </>
          ) : null}
        </p>
      </UpcomingServices>
      <AboutChurchHome />
      <SmallGroups />
      <GetConnected />
    </div>
  );
};

export default Home;
