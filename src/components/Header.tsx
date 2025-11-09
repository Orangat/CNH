import React, { useState, useEffect } from 'react';
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
	cursor: pointer;
`;

const LogoLink = styled(Link)`
	display: flex;
	align-items: center;
	text-decoration: none;
`;

const Logo = styled.img`
	height: 60px;
`;


const NavContainer = styled.nav`
	display: flex;
	align-items: center;

	@media (max-width: 768px) {
		display: none;
	}
`;

const NavLink = styled(Link)`
	font-family: 'Creo', sans-serif;
	font-weight: 700;
	text-decoration: none;
	margin-left: 1rem;
	color: white;
	transition: all 0.2s ease-in-out;

	&:hover {
		color: rgba(255, 255, 255, 0.6);
	}
`;

const NavExternalLink = styled.a`
	font-family: 'Creo', sans-serif;
	font-weight: 700;
	text-decoration: none;
	margin-left: 1rem;
	color: white;
	transition: all 0.2s ease-in-out;

	&:hover {
		color: rgba(255, 255, 255, 0.6);
	}
`;

const DropdownContainer = styled.div`
	position: relative;
	margin-left: 1rem;
`;

const DropdownButton = styled.button`
	font-family: 'Creo', sans-serif;
	font-weight: 700;
	background: none;
	border: none;
	color: white;
	font-size: 1rem;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	padding: 0;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&:hover {
		color: rgba(255, 255, 255, 0.6);
	}
`;

const DropdownArrow = styled.svg<{ isOpen: boolean }>`
	width: 14px;
	height: 9px;
	transition: transform 0.3s ease-in-out;
	transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
	flex-shrink: 0;
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
	position: absolute;
	top: 100%;
	left: 0;
	background-color: #000;
	min-width: 200px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
	visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
	transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
	transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
	z-index: 20;
	margin-top: 0.5rem;
`;

const DropdownLink = styled(Link)`
	font-family: 'Creo', sans-serif;
	font-weight: 300;
	display: block;
	padding: 0.75rem 1rem;
	color: white;
	text-decoration: none;
	transition: background-color 0.2s ease-in-out;

	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
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
		z-index: 100;
	}
`;

// Mobile Menu Overlay
const MobileMenuOverlay = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #faf9f5;
	z-index: 999;
	transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(100%)')};
	transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	overflow-y: auto;
	display: none;
	text-align: left;

	@media (max-width: 768px) {
		display: block;
	}
`;

const MobileMenuHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem 2rem;
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	position: sticky;
	top: 0;
	background-color: #faf9f5;
	z-index: 1;
	text-align: left;
`;

const MobileMenuLogo = styled.img`
	height: 75px;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	font-size: 2rem;
	cursor: pointer;
	color: #000;
	font-weight: normal;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	line-height: 1;
	transition: opacity 0.2s ease;

	&:hover {
		opacity: 0.6;
	}
`;

const MobileMenuContent = styled.div`
	padding: 1.5rem 2rem 2rem 2rem;
	text-align: left;
	width: 100%;
`;

const MobileNavItem = styled.div`
	margin-bottom: 0;
	text-align: left;
	width: 100%;
`;

const MobileNavLink = styled(Link)`
	font-family: 'Creo', sans-serif;
	display: block;
	color: #000;
	text-decoration: none;
	font-size: 1.75rem;
	font-weight: 700;
	text-transform: uppercase;
	padding: 1.25rem 0;
	letter-spacing: 0.3px;
	transition: opacity 0.2s ease;
	line-height: 1.2;
	text-align: left;
	width: 100%;

	&:hover {
		opacity: 0.7;
	}

	&:active {
		opacity: 0.5;
	}
`;

const MobileNavExternalLink = styled.a`
	font-family: 'Creo', sans-serif;
	display: block;
	color: #000;
	text-decoration: none;
	font-size: 1.75rem;
	font-weight: 700;
	text-transform: uppercase;
	padding: 1.25rem 0;
	letter-spacing: 0.3px;
	transition: opacity 0.2s ease;
	line-height: 1.2;
	text-align: left;
	width: 100%;

	&:hover {
		opacity: 0.7;
	}

	&:active {
		opacity: 0.5;
	}
`;

const MobileDropdownButton = styled.button`
	font-family: 'Creo', sans-serif;
	display: flex;
	align-items: center;
	width: 100%;
	background: none;
	border: none;
	color: #000;
	text-decoration: none;
	font-size: 1.75rem;
	font-weight: 700;
	text-transform: uppercase;
	padding: 1.25rem 0;
	letter-spacing: 0.3px;
	cursor: pointer;
	text-align: left;
	transition: opacity 0.2s ease;
	line-height: 1.2;
	gap: 0.5rem;
	
	> span {
		text-align: left;
	}

	&:hover {
		opacity: 0.7;
	}

	&:active {
		opacity: 0.5;
	}
`;

const MobileDropdownIndicator = styled.span`
	font-size: 1.5rem;
	font-weight: 400;
	line-height: 1;
	min-width: 20px;
	text-align: center;
	flex-shrink: 0;
`;

const MobileDropdownDivider = styled.div<{ isOpen: boolean }>`
	height: 1px;
	background-color: #000;
	margin: ${({ isOpen }) => (isOpen ? '0.5rem 0 1rem 0' : '0')};
	opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
	transition: opacity 0.3s ease-in-out, margin 0.3s ease-in-out;
	overflow: hidden;
`;

const MobileDropdownMenu = styled.div<{ isOpen: boolean }>`
	max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
	opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
	overflow: hidden;
	transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out;
	text-align: left;
	width: 100%;
`;

const MobileDropdownLink = styled(Link)`
	font-family: 'Creo', sans-serif;
	display: block;
	color: #000;
	text-decoration: none;
	font-size: 1.4rem;
	font-weight: 700;
	text-transform: uppercase;
	padding: 0.875rem 0 0.875rem 1.5rem;
	letter-spacing: 0.3px;
	transition: opacity 0.2s ease;
	line-height: 1.3;
	text-align: left;
	width: 100%;

	&:hover {
		opacity: 0.7;
	}

	&:active {
		opacity: 0.5;
	}
`;

const Header: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
		setIsMobileDropdownOpen(false);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
		setIsMobileDropdownOpen(false);
	};

	const handleMobileDropdownToggle = () => {
		setIsMobileDropdownOpen(!isMobileDropdownOpen);
	};

	const handleLinkClick = () => {
		closeMobileMenu();
	};

	const handleDropdownMouseEnter = () => {
		setIsDropdownOpen(true);
	};

	const handleDropdownMouseLeave = () => {
		setIsDropdownOpen(false);
	};

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isMobileMenuOpen]);

	return (
		<>
			<HeaderContainer>
				<HeaderContent className="container">
					<LogoContainer>
						<LogoLink to="/">
							<Logo src="/logo.png" alt="Logo" />
						</LogoLink>
					</LogoContainer>
					<NavContainer>
						<DropdownContainer
							onMouseEnter={handleDropdownMouseEnter}
							onMouseLeave={handleDropdownMouseLeave}
						>
							<DropdownButton>
								About Us
								<DropdownArrow 
									isOpen={isDropdownOpen} 
									xmlns="http://www.w3.org/2000/svg" 
									width="14" 
									height="9" 
									viewBox="0 0 14 9" 
									fill="none"
								>
									<path 
										d="M1 1.5L7 7.5L13 1.5" 
										stroke="currentColor" 
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</DropdownArrow>
							</DropdownButton>
							<DropdownMenu isOpen={isDropdownOpen}>
								<DropdownLink to="/we-believe">
									We Believe
								</DropdownLink>
								<DropdownLink to="/leadership">
									Our Leadership
								</DropdownLink>
							</DropdownMenu>
						</DropdownContainer>
						<NavLink to="/events">Events</NavLink>
						<NavExternalLink 
							href="https://churchofnewhope.churchcenter.com/groups" 
							target="_blank" 
							rel="noopener noreferrer"
						>
							Groups
						</NavExternalLink>
						<NavLink to="/give">Give</NavLink>
					</NavContainer>
					<BurgerMenu onClick={toggleMobileMenu}>&#9776;</BurgerMenu>
				</HeaderContent>
			</HeaderContainer>

			{/* Mobile Menu Overlay */}
			<MobileMenuOverlay isOpen={isMobileMenuOpen}>
				<MobileMenuHeader>
					<LogoLink to="/" onClick={handleLinkClick}>
						<MobileMenuLogo src="/logo.png" alt="Logo" />
					</LogoLink>
					<CloseButton onClick={closeMobileMenu}>×</CloseButton>
				</MobileMenuHeader>
				<MobileMenuContent>
					<MobileNavItem>
						<MobileDropdownButton onClick={handleMobileDropdownToggle}>
							<span>ABOUT US</span>
							<MobileDropdownIndicator>
								{isMobileDropdownOpen ? '−' : '+'}
							</MobileDropdownIndicator>
						</MobileDropdownButton>
						<MobileDropdownDivider isOpen={isMobileDropdownOpen} />
						<MobileDropdownMenu isOpen={isMobileDropdownOpen}>
							<MobileDropdownLink to="/we-believe" onClick={handleLinkClick}>
								WE BELIEVE
							</MobileDropdownLink>
							<MobileDropdownLink to="/leadership" onClick={handleLinkClick}>
								OUR LEADERSHIP
							</MobileDropdownLink>
						</MobileDropdownMenu>
					</MobileNavItem>
					<MobileNavItem>
						<MobileNavLink to="/events" onClick={handleLinkClick}>
							EVENTS
						</MobileNavLink>
					</MobileNavItem>
					<MobileNavItem>
						<MobileNavExternalLink 
							href="https://churchofnewhope.churchcenter.com/groups" 
							target="_blank" 
							rel="noopener noreferrer"
							onClick={handleLinkClick}
						>
							GROUPS
						</MobileNavExternalLink>
					</MobileNavItem>
					<MobileNavItem>
						<MobileNavLink to="/give" onClick={handleLinkClick}>
							GIVE
						</MobileNavLink>
					</MobileNavItem>
				</MobileMenuContent>
			</MobileMenuOverlay>
		</>
	);
};

export default Header;
