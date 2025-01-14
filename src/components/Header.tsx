import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
const HeaderContainer = styled.header`
	background-color: #000;
	padding: 1rem 0;
`;

const HeaderContent = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1rem;
	position: relative;  // Ensure the header is positioned for the burger menu
`;

const LogoContainer = styled.div`
	display: flex;
	align-items: center;
`;

const Logo = styled.img`
	height: 60px;
`;

const LogoText = styled.h1`
	font-family: "Pathway Gothic One", sans-serif;
	font-weight: 400;
	font-size: 2rem;
	margin: 0;
	color: white;
`;

const NavContainer = styled.nav<{ isOpen: boolean }>`
	display: flex;
	align-items: center;
	transition: opacity 0.3s ease;

	@media (max-width: 768px) {
		width: 100%;
		flex-direction: column;
		align-items: flex-start;
		opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
		pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
		position: absolute;
		top: 100%;
		left: 0;
		background-color: #000;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 10;  // Ensure the nav is above other elements
	}
`;

const NavLink = styled(Link)`
	text-decoration: none;
	margin-left: 1rem;
	color: white;
	transition: all 0.2s ease-in-out;

	&:hover {
		color: rgba(255, 255, 255, 0.6);
	}

	@media (max-width: 768px) {
		margin: 0.5rem 0;
		width: 100%;  // Make links fill the width on mobile for easier clicking
	}
`;

const BurgerMenu = styled.button`
	background-color: transparent;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	display: none;
	color: white;

	@media (max-width: 768px) {
		display: block;
		position: absolute;
		top: 50%;
		right: 1rem;
		transform: translateY(-50%);
		z-index: 15;  // Ensure the burger menu is on top
	}
`;

const Header: React.FC = () => {
	const [isNavOpen, setIsNavOpen] = useState(false);

	const toggleNavigation = () => {
		setIsNavOpen(!isNavOpen);
	};

	return (
		<HeaderContainer>
			<HeaderContent className="container">
				<LogoContainer>
					<Logo src="/logo.png" alt="Logo" />
					<LogoText>Church Of New Hope</LogoText>
				</LogoContainer>
				<NavContainer isOpen={isNavOpen}>
					<NavLink onClick={() => setIsNavOpen(!isNavOpen)} to="/">Home</NavLink>
					<NavLink onClick={() => setIsNavOpen(!isNavOpen)} to="/we-believe">We Believe</NavLink>
					<NavLink onClick={() => setIsNavOpen(!isNavOpen)} to="https://churchofnewhope.churchcenter.com/groups" rel="noopener noreferrer">Groups</NavLink>
					<NavLink target="_blank"
									 onClick={() => setIsNavOpen(!isNavOpen)} to="https://checkout.square.site/merchant/MLKFAN55FJ2K9/checkout/ENG7TDWLEESOXJ5G5NKC5TTF?src=sheet">Give</NavLink>
				</NavContainer>
				<BurgerMenu onClick={toggleNavigation}>&#9776;</BurgerMenu>
			</HeaderContent>
		</HeaderContainer>
	);
};

export default Header;
