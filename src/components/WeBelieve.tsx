// src/components/WeBelieve.tsx
import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f4f4f4;
  padding-bottom: 4rem;
`;

const Header = styled.div`
  background-color: #000;
  color: white;
  text-align: center;
  padding: 6rem 1rem 4rem;
  margin-bottom: 3rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-family: 'Creo', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Card = styled(motion.div)<{ fullWidth?: boolean }>`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 2rem;
  grid-column: ${({ fullWidth }) => (fullWidth ? '1 / -1' : 'auto')};

  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1.25rem;
    grid-column: 1;
  }
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const Icon = styled.div`
  font-size: 3rem;
  line-height: 1;
  color: #1C5273;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
`;

const CardTitle = styled.h2`
  font-family: 'Creo', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-transform: uppercase;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CardText = styled.p`
  font-family: 'Creo', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  color: #555;
  margin: 0;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

// Icon components using Font Awesome classes
const GodIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-wind" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const BibleIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-book-open" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const ManIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-user" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const SalvationIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-cross" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const AssuranceIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-shield-alt" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const DutiesIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-hands-helping" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const ChurchIcon = () => (
  <IconWrapper>
    <Icon>
      <i className="fas fa-church" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const OrdinancesIcon = () => (
  <IconWrapper>
    <Icon style={{ position: 'relative' }}>
      <i className="fas fa-wine-glass" style={{ color: '#1C5273' }}></i>
    </Icon>
  </IconWrapper>
);

const LastThingsIcon = () => (
  <IconWrapper>
    <Icon style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i className="fas fa-cloud" style={{ color: '#1C5273', position: 'relative', zIndex: 1 }}></i>
      <i className="fas fa-cross" style={{ fontSize: '1rem', color: '#1C5273', position: 'absolute', zIndex: 2 }}></i>
    </Icon>
  </IconWrapper>
);

const WeBelieve = () => {
  const { t } = useLanguage();
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, amount: 0, margin: '-100px' });

  const beliefs = [
    {
      key: 'god',
      icon: <GodIcon />,
    },
    {
      key: 'bible',
      icon: <BibleIcon />,
    },
    {
      key: 'man',
      icon: <ManIcon />,
    },
    {
      key: 'salvation',
      icon: <SalvationIcon />,
    },
    {
      key: 'assurance',
      icon: <AssuranceIcon />,
    },
    {
      key: 'duties',
      icon: <DutiesIcon />,
    },
    {
      key: 'church',
      icon: <ChurchIcon />,
    },
    {
      key: 'ordinances',
      icon: <OrdinancesIcon />,
    },
    {
      key: 'lastThings',
      icon: <LastThingsIcon />,
    },
  ];

  // Check if last card should be full width (odd number of cards)
  const isLastCardFullWidth = beliefs.length % 2 === 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  return (
    <PageWrapper>
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Header>
          <Title>{t('weBelieve.title')}</Title>
        </Header>
      </motion.div>
      <Content>
        <CardsGrid
          ref={gridRef}
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
        >
          {beliefs.map((belief, index) => (
            <Card
              key={belief.key}
              fullWidth={isLastCardFullWidth && index === beliefs.length - 1}
              variants={cardVariants}
            >
              {belief.icon}
              <CardContent>
                <CardTitle>{t(`weBelieve.${belief.key}.title`)}</CardTitle>
                <CardText>{t(`weBelieve.${belief.key}.text`)}</CardText>
              </CardContent>
            </Card>
          ))}
        </CardsGrid>
      </Content>
    </PageWrapper>
  );
};

export default WeBelieve;
