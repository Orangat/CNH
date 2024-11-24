import React from 'react';
import styled from 'styled-components';

// Styled components for the layout and styling
const Section = styled.section`
  position: relative;
  background-image: url("home-groups.jpg"); /* Replace with your image path */
  background-size: cover;
  background-position: center;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Darker overlay with 50% opacity */
    z-index: 1;
  }
`;

const Content = styled.div`
  z-index: 3; /* Content appears on top of the overlay */
`;

const Heading = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
	text-transform: uppercase;
`;

const SubHeading = styled.h6`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: transparent;
  border: 2px solid #fff;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SmallGroups = () => {
	return (
		<Section>
			<Content className="container">
				<Heading>Small Groups</Heading>
				<SubHeading>Get involved in our vibrant community!</SubHeading>
				<Description>
					Small groups are where deep growth and connection happens in our church. We have groups that meet all over Charlotte for families, men, women, and young adults in both languages.
				</Description>
				<ActionButton>JOIN A SMALL GROUP</ActionButton>
			</Content>
		</Section>
	);
};

export default SmallGroups;
