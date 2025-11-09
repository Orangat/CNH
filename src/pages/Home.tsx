import React from 'react';
import UpcomingServices from '../components/UpcompingServices';
import AboutChurchHome from '../components/AboutChurchHome';
import SmallGroups from '../components/SmallGroups';
import GetConnected from '../components/GetConnected';
import { useLocation } from 'react-router-dom';
import { ChurchInformation } from "../utils/enums";


const Home: React.FC = () => {
  const videoUrl = './assets/bg_video.mp4';
  const location = useLocation();

  return (

    <div className="Home">
      <UpcomingServices key={location.pathname} videoUrl={videoUrl}>
        <h1 className="overlay-title">SUNDAYS</h1>
        <p>Join us for services at<br /> {ChurchInformation.ENGLISH_SERVICE_TIME} (English) <br /> {ChurchInformation.UKRAINIAN_SERVICE_TIME} (Ukrainian)</p>
      </UpcomingServices>
      <AboutChurchHome />
      <SmallGroups />
      <GetConnected />
    </div>
  );
};

export default Home;
