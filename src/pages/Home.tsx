import React from 'react';
import UpcomingServices from '../components/UpcompingServices';
import AboutChurchHome from '../components/AboutChurchHome';
import SmallGroups from '../components/SmallGroups';
import { useLocation } from 'react-router-dom';


const Home: React.FC = () => {
  const videoUrl = './assets/bg_video.mp4';
  const location = useLocation();

  return (
    <div className="Home">
      <UpcomingServices key={location.pathname} videoUrl={videoUrl}>
        <h1 className="overlay-title">SUNDAYS</h1>
        <p>Join us for services at<br /> 10:00AM (English) <br /> 12:00PM (Ukrainian)</p>
      </UpcomingServices>
      <AboutChurchHome />
      <SmallGroups />
    </div>
  );
};

export default Home;
