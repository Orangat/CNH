import React from 'react';
import styled from 'styled-components';

interface UpcomingServicesProps {
	videoUrl: string;
	children: React.ReactNode;
}

const StyledVideoBackground = styled.div<{ videoUrl: string }>`
  position: relative;
  overflow: hidden;
  height: calc(100vh - 80px);

  @media (max-width: 768px) {
    height: 600px;
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4); /* Darker overlay with 50% opacity */
    z-index: 1;
  }
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContentOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 2;
  font-family: "Anton", sans-serif;
	width: 100%;

  & h1 {
    font-size: 180px;
    margin: 0;
    font-weight: 700;
    font-style: normal;

    @media (max-width: 768px) {
      font-size: 60px;
    }
  }

  & p {
    font-size: 50px;
    font-weight: 400;
    text-transform: uppercase;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }
`;

const UpcomingServices: React.FC<UpcomingServicesProps> = ({videoUrl, children}) => {
	return (
		<StyledVideoBackground videoUrl={videoUrl}>
			<Video autoPlay loop muted playsInline>
				<source media="(max-width: 768px)" src="videos/bg_video.mp4" type="video/mp4" />
				<source media="(min-width: 769px)" src="videos/bg_video_desctop.mp4" type="video/mp4" />
			</Video>
			<ContentOverlay>
				{children}
			</ContentOverlay>
		</StyledVideoBackground>
	);
};

export default UpcomingServices;
