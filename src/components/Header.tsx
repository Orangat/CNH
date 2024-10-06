import React, {useState} from 'react';
import styled from 'styled-components';

// Styled Components
const HeaderContainer = styled.header`
  background-color: #000;
  color: #fff;
  padding: 10px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    position: relative;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  height: 60px;
  position: relative;
  top: 3px;
`;

const LogoText = styled.h1`
  font-family: "Pathway Gothic One", sans-serif;
  font-weight: 400;
  font-size: 2rem;
  margin: 0;
`;

const NavContainer = styled.nav<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease; /* Add transition for fade in/out */

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    opacity: ${({isOpen}) => (isOpen ? '1' : '0')}; /* Fade in/out effect */
    pointer-events: ${({isOpen}) => (isOpen ? 'auto' : 'none')}; /* Disable pointer events when closed */
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #333;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const NavLink = styled.a`
  color: #fff;
  text-decoration: none;
  margin-left: 1rem;

  &:hover {
    color: #ccc;
  }

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`;

const BurgerMenu = styled.button`
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
  }
`;

// Header Component
const Header: React.FC = () => {
	const [isNavOpen, setIsNavOpen] = useState(false);

	const toggleNavigation = () => {
		setIsNavOpen(!isNavOpen);
	};

	return (
		<>
			<HeaderContainer>
				<div className={"container"}>
					<HeaderContent>
						<LogoContainer>
							<Logo src="/logo.png" alt="Logo"/>
							<LogoText className="logo-header">Church Of New Hope</LogoText>
						</LogoContainer>
						<NavContainer isOpen={isNavOpen}>
							<NavLink href="#">Home</NavLink>
							<NavLink href="#">We Believe</NavLink>
							<NavLink href="#">Groups</NavLink>
							<NavLink target="_blank" href="https://checkout.square.site/merchant/MLKFAN55FJ2K9/checkout/ENG7TDWLEESOXJ5G5NKC5TTF?src=sheet">Give</NavLink>
						</NavContainer>
						<BurgerMenu onClick={toggleNavigation}>&#9776;</BurgerMenu>
					</HeaderContent>
				</div>
			</HeaderContainer>
		</>
	);
};

export default Header;
