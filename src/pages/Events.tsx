import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

// Styled components
const EventsContainer = styled.div`
  min-height: 100vh;
  background-color: #f4f4f4;
  color: black;
  padding: 0;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
`;

const Header = styled.div`
  background-color: #000;
  color: white;
  text-align: center;
  padding: 6rem 1rem 4rem;
  margin-bottom: 3rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-family: 'Creo', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Creo', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin: 1.5rem auto 0;
  line-height: 1.6;
  text-transform: none;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 1rem auto 0;
  }
`;

const CalendarSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 700px;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
    min-height: 600px;
  }

  @media (max-width: 480px) {
    min-height: 500px;
  }
`;

const IframeWrapper = styled.div<{ isLoading: boolean }>`
  position: relative;
  width: 100%;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 700px;
    border: none;
    display: block;
    background-color: white;
    opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
    transition: opacity 0.3s ease-in-out;

    @media (max-width: 768px) {
      height: 600px;
    }

    @media (max-width: 480px) {
      height: 500px;
    }
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div<{ isLoading: boolean }>`
  display: ${({ isLoading }) => (isLoading ? 'flex' : 'none')};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  background-color: white;

  &::after {
    content: '';
    width: 50px;
    height: 50px;
    border: 4px solid #e0e0e0;
    border-top-color: #000;
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
  }
`;

const Events: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  const contentInView = useInView(contentRef, { once: true, amount: 0.3 });

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <EventsContainer>
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Header>
          <Title>{t('events.title')}</Title>
          <Subtitle>
            {t('events.subtitle')}
          </Subtitle>
        </Header>
      </motion.div>

      <Content>
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 30 }}
          animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          <CalendarSection>
          <IframeWrapper isLoading={isLoading}>
            <Spinner isLoading={isLoading} />
            <iframe 
              src="https://churchofnewhope.churchcenter.com/calendar?embed=true&view=gallery" 
              className="planning-center-calender-embed" 
              frameBorder="0"
              title="Church of New Hope Events Calendar"
              allowFullScreen
              onLoad={handleIframeLoad}
              style={{ backgroundColor: 'white' }}
            />
          </IframeWrapper>
          </CalendarSection>
        </motion.div>
      </Content>
    </EventsContainer>
  );
};

export default Events;

