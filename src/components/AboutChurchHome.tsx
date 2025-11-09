import React from 'react';
import styled from 'styled-components';

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
	return (
		<StyledComponentWrapper>
			<StyledText className="container">
				Gospel-centered teaching enriches understanding of faith, while powerful worship inspires and uplifts the spirit. An active community encourages connection and support among individuals, creating a vibrant atmosphere for growth and fellowship in both Ukrainian and English.
			</StyledText>
		</StyledComponentWrapper>
	);
};

export default AboutChurchHome;
