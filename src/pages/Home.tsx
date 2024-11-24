import React from 'react';
import UpcomingServices from '../components/UpcompingServices';
import AboutChurchHome from '../components/AboutChurchHome';
import SmallGroups from '../components/SmallGroups';

const Home: React.FC = () => {
  const videoUrl = './assets/bg_video.mp4';

  return (
    <div className="Home">
      <UpcomingServices videoUrl={videoUrl}>
        <h1 className="overlay-title">SUNDAYS</h1>
        <p>Join us for services at<br /> 9:30AM (Ukrainian) <br /> 12:00PM (English)</p>
      </UpcomingServices>
      <AboutChurchHome />
      <SmallGroups />
    </div>
  );
};

export default Home;
