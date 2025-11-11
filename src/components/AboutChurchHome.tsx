import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const StyledComponentWrapper = styled.div`
  background-color: black;
  padding: 50px 0;
`;

const StyledText = styled.p`
  font-family: 'Creo', sans-serif;
  font-size: 25px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const AboutChurchHome: React.FC = (props) => {
	const { t } = useLanguage();
	return (
		<StyledComponentWrapper>
			<StyledText className="container">
				{t('aboutChurch.description')}
			</StyledText>
		</StyledComponentWrapper>
	);
};

export default AboutChurchHome;
