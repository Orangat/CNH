import React from 'react';
import styled from 'styled-components';

const StyledComponentWrapper = styled.div`
  background-color: black;
  padding: 50px 0px;
`;

const StyledText = styled.p`
  color: white;
  font-size: 25px;
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
