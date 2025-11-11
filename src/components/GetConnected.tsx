import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

// Styled components for the layout and styling
const Section = styled.section`
	position: relative;
	background-color: #1a1a1a;
	padding: 80px 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
`;

const Content = styled.div`
	z-index: 3;
	max-width: 800px;
`;

const Heading = styled.h2`
	font-family: 'Creo', sans-serif;
	font-size: 2.5rem;
	font-weight: 700;
	margin-bottom: 1rem;
	text-transform: uppercase;
	color: #fff;
`;

const SubHeading = styled.h6`
	font-family: 'Creo', sans-serif;
	font-size: 1.25rem;
	font-weight: 700;
	margin-bottom: 1rem;
	color: #fff;
`;

const Description = styled.p`
	font-family: 'Creo', sans-serif;
	font-size: 1rem;
	font-weight: 300;
	margin-bottom: 2rem;
	color: #fff;
	line-height: 1.6;
`;

const ActionButton = styled.a`
	font-family: 'Creo', sans-serif;
	padding: 0.75rem 2rem;
	background-color: transparent;
	border: 2px solid #fff;
	color: #fff;
	cursor: pointer;
	font-size: 1rem;
	font-weight: 700;
	text-decoration: none;
	display: inline-block;
	transition: background-color 0.3s ease, color 0.3s ease;
	text-transform: uppercase;

	&:hover {
		background-color: #fff;
		color: #1a1a1a;
	}
`;

const GetConnected = () => {
	const { t } = useLanguage();
	return (
		<Section>
			<Content className="container">
				<Heading>{t('getConnected.title')}</Heading>
				<SubHeading>{t('getConnected.subtitle')}</SubHeading>
				<Description>
					{t('getConnected.description')}
				</Description>
				<ActionButton 
					href="https://churchofnewhope.churchcenter.com/people/forms/922690" 
					target="_blank"
					rel="noopener noreferrer"
				>
					{t('getConnected.button')}
				</ActionButton>
			</Content>
		</Section>
	);
};

export default GetConnected;

