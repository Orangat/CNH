import React from 'react';
import styled from 'styled-components';

// interface AboutChurchHome {
// 	// Define your props here
// }

const StyledComponentWrapper = styled.div`
  background-color: black;
  padding: 50px 20px;
`;

const StyledText = styled.p`
  color: white;
  font-size: 35px;
`;

const AboutChurchHome: React.FC = (props) => {
	return (
		<StyledComponentWrapper>
			<StyledText className="container">
				Gospel-centered teaching, powerful worship, and active community in both Ukrainian and English
			</StyledText>
		</StyledComponentWrapper>
	);
};

export default AboutChurchHome;
