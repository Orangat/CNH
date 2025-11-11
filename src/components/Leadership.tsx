import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

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

const LeaderCard = styled.div`
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

const Leadership = () => {
  const leaders = [
    {
      name: 'Vasily & Lucy Rudnitsky',
      title: 'Senior Pastor & Church Accountant',
      emails: ['vasily@cnhcharlotte.com', 'accounting@cncharlotte.com'],
      photo: '/images/rudn.jpg',
    },
    {
      name: 'Yuriy Rudnitsky',
      title: 'English Service Pastor',
      emails: ['yuriy@cnhcharlotte.com'],
      photo: '/images/yurrudn.jpg',
    },
    {
      name: 'Anatoli Plukchi',
      title: 'Home Groups Pastor',
      emails: ['homegroups@cnhcharlotte.com'],
      photo: '/images/plukchii.jpg',
    },
    {
      name: 'Dima Grinchak',
      title: 'Pastor',
      emails: ['info@cnhcharlotte.com'],
      photo: '',
    },
    {
      name: 'Alexander Grinchak',
      title: 'Visitation Pastor',
      emails: ['info@cnhcharlotte.com'],
      photo: '/images/grinchak.jpg',
    },
    {
      name: 'Yevgenni Prannik',
      title: 'Hospitality Pastor',
      emails: ['info@cnhcharlotte.com'],
      photo: '/images/pranik.jpg',
    },
    {
      name: 'Andrii Kyslianka',
      title: 'Family Pastor',
      emails: ['info@cnhcharlotte.com'],
      photo: '/images/kuslanka.jpg',
    },
    {
      name: 'Andriy Omeliash',
      title: 'Church Administrator',
      emails: ['administrator@cnhcharlotte.com'],
      photo: '/images/omelash.jpg',
    },
    {
      name: 'Artem Topchi',
      title: 'Head Deacon',
      emails: ['artem@cnhcharlotte.com'],
      photo: '/images/topchiiArtem.jpg',
    },
    {
      name: 'Maksym & Victoria Sak',
      title: 'Ministry Operations Director & Creative Media Manager',
      emails: ['maksym@cnhcharlotte.com', 'creative@cnhcharlotte.com'],
      photo: '/images/sak.jpg',
    },
    {
      name: 'Iurii & Angelina Prokopchuk',
      title: "Service Director & Women's Ministry Director",
      emails: ['iurii@cnhcharlotte.com', 'women@cnhcharlotte.com'],
      photo: '/images/prokopchuk.jpg',
    },
    {
      name: 'Vitaliy Kuprovsky',
      title: 'Creative & Production Director',
      emails: ['info@cnhcharlotte.com'],
      photo: '/images/kuprovskii.jpg',
    },
    {
      name: 'Alexander Berezovsky',
      title: 'Missions Director',
      emails: ['missions@cnhcharlotte.com'],
      photo: '',
    },
    {
      name: 'Katie Topchi',
      title: 'Worship Ministry Director',
      emails: ['worship@cnhcharlotte.com'],
      photo: '/images/katetopchii.jpg',
    },
    {
      name: 'Irina Zigalenko',
      title: 'Choir Director',
      emails: ['worship@churchofnewhope.org'],
      photo: '',
    },
    {
      name: 'Vlad Ferkaliak',
      title: "Men's Ministry Director",
      emails: ['men@cnhcharlotte.com'],
      photo: '/images/ferkal.jpg',
    },
    {
      name: 'Vitalii Arshulik',
      title: 'Youth Ministry Director',
      emails: ['youth@churchofnewhope.org'],
      photo: '',
    },
    {
      name: 'David Pavlyuk',
      title: 'Youth Ministry Leader',
      emails: ['youth@cnhcharlotte.com'],
      photo: '/images/david.jpg',
    },
    {
      name: 'Vasily and Olena Manilenko',
      title: "Children's Ministry Directors",
      emails: ['kids@churchofnewhope.org'],
      photo: '',
    },
    {
      name: 'Natalia Bohodenko',
      title: 'Kids Choir Director',
      emails: [],
      photo: '',
    },
    {
      name: 'Maks Mitin',
      title: 'Sunday School Director',
      emails: ['kids@cnhcharlotte.com'],
      photo: '/images/metin.jpg',
    },
    {
      name: 'Julie Romanteyev',
      title: 'Social Media Manager',
      emails: ['creative@cnhcharlotte.com'],
      photo: '/images/yulia.jpg',
    },
    {
      name: 'Nelia Olos',
      title: 'Hospitality Director',
      emails: ['hospitality@cnhcharlotte.com'],
      photo: '/images/olos.jpg',
    },
    {
      name: 'Olena Soloninko',
      title: 'Décor Director',
      emails: ['info@churchofnewhope.org'],
      photo: '',
    },
    {
      name: 'Victoria Kyshko',
      title: 'Kitchen Ministry Director',
      emails: ['info@cnhcharlotte.com'],
      photo: '/images/kushko.jpg',
    },
  ];

  const { t } = useLanguage();
  return (
    <PageWrapper>
      <Header>{t('leadership.title')}</Header>
      <LeadersGrid>
        {leaders.map((leader, index) => (
          <LeaderCard key={index}>
            <LeaderImage src={leader.photo || '/images/placeholder.png'} alt={leader.name} />
            <LeaderInfo>
              <LeaderName>{leader.name}</LeaderName>
              <LeaderTitle>{leader.title}</LeaderTitle>
              {leader.emails && leader.emails.length > 0 && leader.emails.map((email, idx) => (
                <LeaderEmail key={idx}><a href={`mailto:${email}`}>{email}</a></LeaderEmail>
              ))}
            </LeaderInfo>
          </LeaderCard>
        ))}
      </LeadersGrid>
    </PageWrapper>
  );
};

export default Leadership;
