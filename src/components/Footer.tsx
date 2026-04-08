import React from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useContactInfo } from '../data/useContactInfo';

// Styled components for the footer layout and styling
const FooterSection = styled.footer`
  background-color: #000;
  color: rgba(255, 255, 255, 0.8);
  padding: 2rem 0;
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Creo', sans-serif;
  font-weight: 300;

  &.left {
    align-items: flex-start;
    text-align: left;
  }

  &.right {
    align-items: flex-start;
    text-align: left;
  }

  a {
    font-family: 'Creo', sans-serif;
    font-weight: 300;
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s ease-in-out;

    &:hover {
      color: rgba(255, 255, 255, 0.6);
    }
  }
`;

const Title = styled.h3`
  font-family: 'Creo', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-transform: uppercase;
`;

const IconRow = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin: 0;

  i {
    font-size: 1.25rem;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;

  a {
    color: #fff;
    font-size: 1.5rem;
    text-decoration: none;

    &:hover {
      color: #ccc;
    }
  }
`;

const Copyright = styled.p`
  font-family: 'Creo', sans-serif;
  font-weight: 300;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || language;
  const { data: contact } = useContactInfo();
  const telHref = `tel:${contact.phone.replace(/[^+\d]/g, '')}`;

  const getLocalizedPath = (path: string) => {
    return `/${currentLang}${path}`;
  };

  return (
    <FooterSection>
      <div className="container">
        <FooterContainer>
          {/* Left Column */}
          <Column className="left">
            <Title>{t('footer.churchName')}</Title>
            <IconRow>
              <i className="fas fa-map-marker-alt"></i>
              <a href={contact.map_url} target="_blank" rel="noopener noreferrer">
                {contact.address}
              </a>
            </IconRow>
            <IconRow>
              <i className="fas fa-phone"></i>
              <a href={telHref} style={{ color: 'inherit', textDecoration: 'none' }}>
                {contact.phone}
              </a>
            </IconRow>
            <IconRow>
              <i className="fas fa-clock"></i>
              {contact.service_time_english} ({t('home.english')}), {contact.service_time_ukrainian} ({t('home.ukrainian')})
            </IconRow>
          </Column>

          {/* Right Column */}
          <Column className="right">
            <SocialIcons>
              <a href={contact.facebook_url} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href={contact.youtube_url} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </SocialIcons>
            <ul>
              <li><Link to={getLocalizedPath('/we-believe')}>{t('nav.weBelieve')}</Link></li>
              <li><Link to={getLocalizedPath('/leadership')}>{t('nav.ourLeadership')}</Link></li>
              <li><Link to={getLocalizedPath('/events')}>{t('nav.events')}</Link></li>
              <li><a href="https://churchofnewhope.churchcenter.com/groups" target="_blank" rel="noopener noreferrer">{t('nav.groups')}</a></li>
              <li><Link to={getLocalizedPath('/give')}>{t('nav.give')}</Link></li>
            </ul>
            <Copyright>{t('footer.copyright')}</Copyright>
          </Column>
        </FooterContainer>
      </div>
    </FooterSection>
  );
};

export default Footer;
