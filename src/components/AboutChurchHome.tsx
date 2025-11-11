import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
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
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, amount: 0.3 });

	return (
		<StyledComponentWrapper>
			<motion.div
				ref={ref}
				initial={{ opacity: 0, y: 50 }}
				animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="container"
			>
				<StyledText>
					{t('aboutChurch.description')}
				</StyledText>
			</motion.div>
		</StyledComponentWrapper>
	);
};

export default AboutChurchHome;
