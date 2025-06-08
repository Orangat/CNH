import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  background-color: #f4f4f4;
  padding-bottom: 4rem;
`;

const Header = styled.div`
  background-color: #000;
  color: white;
  text-align: center;
  padding: 4rem 1rem;
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
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
  margin: 0;
  font-size: 1.25rem;
  color: black;
`;

const LeaderTitle = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #157a6e;
  font-weight: 500;
`;

const LeaderEmail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #555;
`;

const Leadership = () => {
  const leaders = [
    {
      name: 'Vasily & Lucy Rudnitsky',
      title: 'Senior Pastor & Church Accountant',
      emails: ['Vasily@cnhcharlotte.com', 'Accounting@cncharlotte.com'],
      photo: '/images/rudn.jpg',
    },
    {
      name: 'Yuriy Rudnitsky',
      title: 'English Service Pastor',
      emails: ['Yuriy@cnhcharlotte.com'],
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
      emails: ['Info@cnhcharlotte.com'],
      photo: '',
    },
    {
      name: 'Alexander Grinchak',
      title: 'Visitation Pastor',
      emails: ['Info@cnhcharlotte.com'],
      photo: '/images/grinchak.jpg',
    },
    {
      name: 'Yevgenni Prannik',
      title: 'Hospitality Pastor',
      emails: ['Info@cnhcharlotte.com'],
      photo: '/images/kolesnikov.jpg',
    },
    {
      name: 'Andrii Kyslianka',
      title: 'Family Pastor',
      emails: ['Info@cnhcharlotte.com'],
      photo: '/images/kuslanka.jpg',
    },
    {
      name: 'Andriy Omeliash',
      title: 'Church Administrator',
      emails: ['Administrator@cnhcharlotte.com'],
      photo: '/images/omelash.jpg',
    },
    {
      name: 'Artem Topchi',
      title: 'Head Deacon',
      emails: ['Artem@cnhcharlotte.com'],
      photo: '/images/topchiiArtem.jpg',
    },
    {
      name: 'Maksym & Victoria Sak',
      title: 'Ministry Operations Director & Creative Media Manager',
      emails: ['Maksym@cnhcharlotte.com', 'Creative@cnhcharlotte.com'],
      photo: '/images/sak.jpg',
    },
    {
      name: 'Vitaliy Kuprovskiy',
      title: 'Media Ministry Director',
      emails: ['Info@cnhcharlotte.com'],
      photo: '/images/kuprovskii.jpg',
    },
    {
      name: 'Alexander Berezovsky',
      title: 'Missions Director',
      emails: ['Missions@cnhcharlotte.com'],
      photo: '',
    },
    {
      name: 'Katie Topchi',
      title: 'Worship Ministry Leader',
      emails: ['Worship@cnhcharlotte.com'],
      photo: '',
    },
    {
      name: 'Vlad Ferkaliak',
      title: 'Men’s Ministry Director',
      emails: ['Men@cnhcharlotte.com'],
      photo: '/images/ferkal.jpg',
    },
    {
      name: 'Angelina Prokopchuk',
      title: 'Women’s Ministry Director',
      emails: ['women@cnhcharlotte.com'],
      photo: '/images/kushko.jpg',
    },
    {
      name: 'David Pavlyuk',
      title: 'Youth Ministry Leader',
      emails: ['Youth@cnhcharlotte.com'],
      photo: '/images/david.jpg',
    },
    {
      name: 'Maks Mitin',
      title: 'Sunday School Director',
      emails: ['Kids@cnhcharlotte.com'],
      photo: '/images/metin.jpg',
    },
    {
      name: 'Julie Romanteyev',
      title: 'Social Media Manager',
      emails: ['creative@cnhcharlotte.com'],
      photo: '/images/yulia.jpg',
    },
    {
      name: 'Victoria Kyshko',
      title: 'Kitchen Ministry Director',
      emails: ['Info@cnhcharlotte.com'],
      photo: '/images/kushko.jpg',
    },
  ];

  return (
    <PageWrapper>
      <Header>Our Leadership</Header>
      <LeadersGrid>
        {leaders.map((leader, index) => (
          <LeaderCard key={index}>
            <LeaderImage src={leader.photo || '/images/placeholder.png'} alt={leader.name} />
            <LeaderInfo>
              <LeaderName>{leader.name}</LeaderName>
              <LeaderTitle>{leader.title}</LeaderTitle>
              {leader.emails.map((email, idx) => (
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
