import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useLeaders } from '../data/useLeaders';
import { leaderPhotoUrl } from '../lib/supabase';
import { LeaderRow } from '../data/types';

const PageWrapper = styled.div`
  background-color: #f4f4f4;
  padding-bottom: 4rem;
`;

const Header = styled.div`
  font-family: 'Creo', sans-serif;
  background-color: #000;
  color: white;
  text-align: center;
  padding: 6rem 1rem 4rem;
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const LeadersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 2rem;
  max-width: 1080px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

const LeaderCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 338px;
`;

const LeaderImage = styled.img`
  width: 338px;
  height: 338px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
`;

const LeaderInfo = styled.div`
  padding: 1rem;
`;

const LeaderName = styled.h3`
  font-family: 'Creo', sans-serif;
  margin: 0;
  font-size: 18px;
  color: black;
  font-weight: 700;
`;

const LeaderTitle = styled.p`
  font-family: 'Creo', sans-serif;
  margin: 0.5rem 0 0;
  font-size: 16px;
  color: #157a6e;
  font-weight: 700;
`;

const LeaderEmail = styled.p`
  font-family: 'Creo', sans-serif;
  margin: 0.25rem 0;
  font-size: 14px;
  font-weight: 300;
  color: #555;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const LeaderCardWithAnimation: React.FC<{
  leader: LeaderRow;
  index: number;
  language: 'en' | 'uk';
}> = ({ leader, index, language }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldShowImmediately = index < 3;
  const isInView = useInView(cardRef, { once: true, amount: 0.2, margin: '-150px 0px' });
  const shouldAnimate = shouldShowImmediately || isInView;

  const name = language === 'uk' && leader.name_uk ? leader.name_uk : leader.name_en;
  const title = language === 'uk' && leader.title_uk ? leader.title_uk : leader.title_en;

  return (
    <LeaderCard
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
    >
      <LeaderImage src={leaderPhotoUrl(leader.photo_path)} alt={name} />
      <LeaderInfo>
        <LeaderName>{name}</LeaderName>
        <LeaderTitle>{title}</LeaderTitle>
        {leader.emails && leader.emails.length > 0 && leader.emails.map((email, idx) => (
          <LeaderEmail key={idx}><a href={`mailto:${email}`}>{email}</a></LeaderEmail>
        ))}
      </LeaderInfo>
    </LeaderCard>
  );
};

const Leadership = () => {
  const { t, language } = useLanguage();
  const { data: leaders } = useLeaders();

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Header>{t('leadership.title')}</Header>
      </motion.div>
      <LeadersGrid>
        {leaders.map((leader, index) => (
          <LeaderCardWithAnimation
            key={leader.id}
            leader={leader}
            index={index}
            language={language}
          />
        ))}
      </LeadersGrid>
    </PageWrapper>
  );
};

export default Leadership;
