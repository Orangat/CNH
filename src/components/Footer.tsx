import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ChurchInformation } from "../utils/enums";  // Import Link from react-router-dom

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

  &.left {
    align-items: flex-start;
    text-align: left;
  }

  &.right {
    align-items: flex-start;
    text-align: left;
  }

  a {
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s ease-in-out;

    &:hover {
      color: rgba(255, 255, 255, 0.6);
    }
  }
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
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
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const Footer: React.FC = () => {
  return (
    <FooterSection>
      <div className="container">
        <FooterContainer>
          {/* Left Column */}
          <Column className="left">
            <Title>Church of New Hope</Title>
            <IconRow>
              <i className="fas fa-map-marker-alt"></i>
              <a
                href="https://www.google.com/maps/place/Church+of+New+Hope/@35.1386539,-80.6753961,17z/data=!4m15!1m8!3m7!1s0x8854237512253b49:0xd6feb6ee5600c036!2s13601+Idlewild+Rd,+Matthews,+NC+28105!3b1!8m2!3d35.1386539!4d-80.6753961!16s%2Fg%2F11c2bgk14q!3m5!1s0x8854233f1c141bad:0x52bdf54b20d5ecbd!8m2!3d35.1386659!4d-80.6753908!16s%2Fg%2F11r6_nkvqv?entry=ttu&g_ep=EgoyMDI0MTExOS4yIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ChurchInformation.CHURCH_ADDRESS}
              </a>
            </IconRow>
            <IconRow>
              <i className="fas fa-phone"></i>
              <a href="tel:+17044539365" style={{ color: 'inherit', textDecoration: 'none' }}>
                {ChurchInformation.CHURCH_PHONE}
              </a>
            </IconRow>
            <IconRow>
              <i className="fas fa-clock"></i>
              {ChurchInformation.ENGLISH_SERVICE_TIME} (English), {ChurchInformation.UKRAINIAN_SERVICE_TIME} (Ukrainian)
            </IconRow>
          </Column>

          {/* Right Column */}
          <Column className="right">
            <SocialIcons>
              <a href="https://www.facebook.com/CNHCharlotte" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/cnhcharlotte?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.youtube.com/@ChurchOfNewHopeUA/streams" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </SocialIcons>
            <ul>
              <li><Link to="/">Home</Link></li> {/* Home link using Link */}
              <li><Link to="/we-believe">We Believe</Link></li> {/* We Believe link using Link */}
              <li><a href="https://churchofnewhope.churchcenter.com/groups" target="_blank" rel="noopener noreferrer">Groups</a></li>
              <li><a target="_blank" rel="noopener noreferrer" href="https://checkout.square.site/merchant/MLKFAN55FJ2K9/checkout/ENG7TDWLEESOXJ5G5NKC5TTF?src=sheet">Give</a></li>
            </ul>
            <Copyright>&copy; 2025 Church of New Hope. All rights reserved.</Copyright>
          </Column>
        </FooterContainer>
      </div>
    </FooterSection>
  );
};

export default Footer;
