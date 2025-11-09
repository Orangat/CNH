import React from 'react';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';

// Styled components
const GiveContainer = styled.div`
  min-height: 100vh;
  background-color: #f4f4f4;
  color: black;
  padding: 0;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  background-color: #000;
  color: white;
  text-align: center;
  padding: 8rem 1rem;
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 3rem;
  width: 100%;
`;

const Title = styled.h1`
  font-family: 'Creo', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: 'Creo', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 1rem auto 0;
  line-height: 1.6;
  text-transform: none;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(250px, 1fr);
  }
`;

const OptionCard = styled.div`
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const ClickableOptionCard = styled.a`
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
    text-decoration: none;
    color: inherit;
  }
`;

const OptionTitle = styled.h3`
  font-family: 'Creo', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: black;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptionDescription = styled.p`
  font-family: 'Creo', sans-serif;
  font-weight: 300;
  color: #555;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ZelleInfo = styled.div`
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-family: 'Creo', sans-serif;
  font-weight: 700;
  color: #555;
`;

const InfoValue = styled.span`
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: black;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 0;
`;

const QRCodeContainer = styled.div`
  text-align: center;
  margin: 1.5rem 0;
`;

const QRCodeWrapper = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.a`
  font-family: 'Creo', sans-serif;
  display: inline-block;
  background-color: #000;
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
  transition: all 0.3s ease;
  text-align: center;
  width: 100%;
  
  &:hover {
    background-color: #333;
    transform: translateY(-1px);
  }
`;

const PayPalButton = styled(Button)`
  background-color: #0070ba;
  color: white;
  
  &:hover {
    background-color: #005ea6;
  }
`;

const ExternalLinkIcon = styled.i`
  margin-left: 0.5rem;
  font-size: 0.8rem;
`;

const Give: React.FC = () => {
    // Generate QR code for Zelle phone number
    const zellePhoneNumber = "(704) 453-9365";


    return (
        <GiveContainer>
            <Header>
                <Title>Give</Title>
                <Subtitle>
                    Support the ministry of Church of New Hope through your generous giving.
                    Choose from the options below to make your donation.
                </Subtitle>
            </Header>

            <Content>
                <OptionsGrid>
                    {/* Zelle Option */}
                    <OptionCard>
                        <OptionTitle>
                            <i className="fas fa-mobile-alt"></i>
                            Zelle
                        </OptionTitle>
                        <OptionDescription>
                            Send your donation directly to our Zelle account. Fast, secure, and no fees. Please include a note with your donation.
                        </OptionDescription>

                        <ZelleInfo>
                            <InfoRow>
                                <InfoLabel>Phone:</InfoLabel>
                                <InfoValue>{zellePhoneNumber}</InfoValue>
                            </InfoRow>
                            <InfoRow>
                                <InfoLabel>Note:</InfoLabel>
                                <InfoValue>Tithe + Last Name</InfoValue>
                            </InfoRow>
                        </ZelleInfo>

                        <QRCodeContainer>
                            <QRCodeWrapper>
                                <QRCodeCanvas
                                    value={zellePhoneNumber}
                                    size={160}
                                    level="M"
                                    includeMargin={true}
                                />
                            </QRCodeWrapper>
                            <p style={{ fontFamily: "'Creo', sans-serif", fontWeight: 300, marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                Scan with your banking app
                            </p>
                        </QRCodeContainer>

                    </OptionCard>

                    {/* PayPal Option */}
                    <ClickableOptionCard href="https://www.paypal.com/donate/?hosted_button_id=WN6DWH9H8KTB4" target="_blank" rel="noopener noreferrer">
                        <OptionTitle>
                            <i className="fab fa-paypal"></i>
                            PayPal
                        </OptionTitle>
                        <OptionDescription>
                            Donate securely through PayPal. You can use your PayPal balance or link a bank account or card.
                        </OptionDescription>

                        <PayPalButton href="https://www.paypal.com/donate/?hosted_button_id=WN6DWH9H8KTB4" target="_blank" rel="noopener noreferrer">
                            Donate with PayPal
                            <ExternalLinkIcon className="fas fa-external-link-alt"></ExternalLinkIcon>
                        </PayPalButton>

                        <p style={{ fontFamily: "'Creo', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                            <i className="fas fa-info-circle"></i>
                            &nbsp;Secure donations processed by PayPal
                        </p>
                    </ClickableOptionCard>

                    {/* Square Checkout Option */}
                    <ClickableOptionCard href="https://checkout.square.site/merchant/MLKFAN55FJ2K9/checkout/ENG7TDWLEESOXJ5G5NKC5TTF?src=sheet" target="_blank" rel="noopener noreferrer">
                        <OptionTitle>
                            <i className="fas fa-credit-card"></i>
                            Online Giving
                        </OptionTitle>
                        <OptionDescription>
                            Use our secure online giving platform powered by Square. Accepts all major credit cards and bank transfers.
                        </OptionDescription>

                        <Button href="https://checkout.square.site/merchant/MLKFAN55FJ2K9/checkout/ENG7TDWLEESOXJ5G5NKC5TTF?src=sheet" target="_blank" rel="noopener noreferrer">
                            Give Online
                            <ExternalLinkIcon className="fas fa-external-link-alt"></ExternalLinkIcon>
                        </Button>
                    </ClickableOptionCard>
                </OptionsGrid>

                {/* Additional Information */}
                <div style={{ 
                    marginTop: '3rem', 
                    textAlign: 'center', 
                    color: 'white',
                    backgroundColor: '#000',
                    padding: '3rem 1rem',
                    width: '100vw',
                    marginLeft: 'calc(-50vw + 50%)',
                    marginRight: 'calc(-50vw + 50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <p style={{ fontFamily: "'Creo', sans-serif", fontWeight: 300, margin: '0', maxWidth: '600px' }}>
                        <i className="fas fa-heart"></i>
                        &nbsp;Thank you for your generous support of our ministry!
                    </p>
                    <p style={{ fontFamily: "'Creo', sans-serif", fontWeight: 300, fontSize: '0.9rem', marginTop: '1rem', color: 'rgba(255, 255, 255, 0.8)', margin: '0', maxWidth: '600px' }}>
                        All donations are tax-deductible. You will receive a receipt for your records.
                    </p>
                </div>
            </Content>
        </GiveContainer>
    );
};

export default Give; 