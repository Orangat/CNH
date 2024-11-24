// src/components/WeBelieve.tsx
import React from 'react';
import styled from 'styled-components';

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  max-height: 600px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  max-height: 600px;
  object-fit: cover; /* Ensures the image covers the area */
  object-position: center center; /* Centers the image */
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); // Dark transparent overlay
  z-index: 1; // Ensures the overlay stays on top of the image
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SubTitle = styled.h2`
  font-size: 1.75rem;
  color: #2980b9;
  margin-top: 30px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Section = styled.div`
  margin-bottom: 25px;
`;

const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  text-align: justify;
`;

const WeBelieve = () => {
  return (
    <div>
      <ImageWrapper>
        <Image src="/webelieve.jpg" alt="We Believe" />
        <Overlay />
      </ImageWrapper>

      <Container>
        <Title>STATEMENT OF FAITH</Title>

        <Section>
          <SubTitle>GOD</SubTitle>
          <Paragraph>
            We believe that there is only one true, living, and eternal God and that the Godhead is revealed as Father,
            Son, and Holy Spirit.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>THE BIBLE</SubTitle>
          <Paragraph>
            We believe that the Holy Scriptures are the Old and New Testaments; the inspired and infallible Word of God
            and therein is found the only reliable guide of Christian faith and conduct.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>MAN</SubTitle>
          <Paragraph>
            We believe that God created man in His own image to bring Him honor through obedience, and that when man
            disobeyed, he became a fallen and sinful creature, unable to save himself. We believe that infants are in
            the covenant of God's grace and that all persons become accountable to God when they reach a state of moral
            responsibility.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>SALVATION</SubTitle>
          <Paragraph>
            We believe that salvation (regeneration, sanctification, justification, and redemption) has been provided
            for all mankind through the redemptive work (life, death, resurrection, ascension, and intercession) of
            Jesus Christ, and that this salvation can be received only through repentance toward God and faith toward
            our Lord Jesus Christ.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>ASSURANCE AND ENDURANCE</SubTitle>
          <Paragraph>
            We believe that those who abide in Christ have the assurance of salvation. However, we believe that the
            Christian retains his freedom of choice; therefore, it is possible for him to turn away from God and be
            finally lost.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>CHRISTIAN DUTIES</SubTitle>
          <Paragraph>
            We believe that Christians should live faithfully by serving in and through the local church, praying
            diligently, witnessing earnestly, practicing tolerance, showing loving kindness, giving as God prospers, and
            conducting themselves in such a way as to bring glory to God.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>THE CHURCH</SubTitle>
          <Paragraph>
            We believe that the Church Universal is the Body of Christ, the fellowship of all believers, and that its
            members have been called out from the world to come under the dominion and authority of Christ, its Head. We
            believe that a local church is a fellowship of Christians, a part of the Body of Christ, voluntarily banded
            together for worship, nurture, and service.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>ORDINANCES</SubTitle>
          <Paragraph>
            We believe that baptism and the Lord's Supper are ordinances instituted by Christ to be observed by
            Christians only. We also believe that the biblical mode of baptism is immersion and that participation in
            the Lord's Supper should be open to all Christians.
          </Paragraph>
        </Section>

        <Section>
          <SubTitle>LAST THINGS</SubTitle>
          <Paragraph>
            We believe in the personal return of Jesus Christ, and in the bodily resurrection of the dead. We believe
            that God will judge all mankind by Jesus Christ; that He will reward the righteous with eternal life in
            heaven, and that He will banish the unrighteous to everlasting punishment in hell.
          </Paragraph>
        </Section>
      </Container>
    </div>
  );
};

export default WeBelieve;
