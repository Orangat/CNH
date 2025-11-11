import React from 'react';
import UpcomingServices from '../components/UpcompingServices';
import AboutChurchHome from '../components/AboutChurchHome';
import SmallGroups from '../components/SmallGroups';
import GetConnected from '../components/GetConnected';
import { useLocation } from 'react-router-dom';
import { ChurchInformation } from "../utils/enums";
import { useLanguage } from '../contexts/LanguageContext';


const Home: React.FC = () => {
  const videoUrl = './assets/bg_video.mp4';
  const location = useLocation();
  const { t } = useLanguage();

  return (

    <div className="Home">
      <UpcomingServices key={location.pathname} videoUrl={videoUrl}>
        <h1 className="overlay-title">{t('home.sundays')}</h1>
        <p>{t('home.joinUs')}<br /> {ChurchInformation.ENGLISH_SERVICE_TIME} ({t('home.english')}) <br /> {ChurchInformation.UKRAINIAN_SERVICE_TIME} ({t('home.ukrainian')})</p>
      </UpcomingServices>
      <AboutChurchHome />
      <SmallGroups />
      <GetConnected />
    </div>
  );
};

export default Home;
