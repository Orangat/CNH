import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

// Styled components for the layout and styling
const Section = styled.section`
	position: relative;
	background-image: url("home-groups.jpg");
	background-size: cover;
	background-position: center;
	height: 400px;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;

	&:before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 1;
	}
`;

const Content = styled.div`
	z-index: 3;
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
	margin-bottom: 1.5rem;
	color: #fff;
`;

const ActionLink = styled.a`
	font-family: 'Creo', sans-serif;
	padding: 0.75rem 2rem;
	background-color: transparent;
	border: 2px solid #fff;
	color: #fff;
	cursor: pointer;
	font-size: 1rem;
	font-weight: 700;
	text-decoration: none;
	text-transform: uppercase;
	transition: background-color 0.3s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
`;

const SmallGroups = () => {
	const { t } = useLanguage();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, amount: 0.3 });

	return (
		<Section>
			<Content ref={ref} className="container">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
				>
					<Heading>{t('smallGroups.title')}</Heading>
					<SubHeading>{t('smallGroups.subtitle')}</SubHeading>
					<Description>
						{t('smallGroups.description')}
					</Description>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
					transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					style={{ display: 'inline-block' }}
				>
					<ActionLink 
						href="https://churchofnewhope.churchcenter.com/groups" 
						target="_blank"
					>
						{t('smallGroups.joinButton')}
					</ActionLink>
				</motion.div>
			</Content>
		</Section>
	);
};

export default SmallGroups;
