import { Link } from 'react-router-dom';
import './Header.css';
import { navbarMotion } from '../../../../variants';
import { motion as Motion } from 'framer-motion';
import { scrollIntoSection } from '../../../../utils';
import { useState } from 'react';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Prevent scrolling when menu is open
        document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
    };

    return (
        <Motion.header variants={navbarMotion} 
        initial="hidden" 
        animate="visible">
            <h1 className='logo'>FlowSync</h1>
            <button 
    className="mobile-menu-btn" 
    onClick={toggleMobileMenu}
    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
>
    {isMobileMenuOpen ? (
        <i className="fas fa-times" aria-hidden="true"></i>
    ) : (
        <i className="fas fa-bars" aria-hidden="true"></i>
    )}
</button>
            <nav className={isMobileMenuOpen ? 'active' : ''}>
                <ul>
                    <li onClick={() => scrollIntoSection("home")}><a href="#home" className="link" style={{color: 'white'}}>Home</a></li>
                    <li onClick={() => scrollIntoSection("features")}><a href="#features" className="link" style={{color: 'white'}}>Features</a></li>
                    <li onClick={() => scrollIntoSection("how-it-works")}><a href="#how-it-works" className="link" style={{color: 'white'}}>How It Works</a></li>
                    <li onClick={() => scrollIntoSection("about")}><a href="#about" className="link" style={{color: 'white'}}>About</a></li>
                    <Link to="/register" className='sign-up'>Sign Up</Link>
                    <Link to="/login" className='log-in'>Log in</Link>
                </ul>
            </nav>
            
            {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu}></div>}
        </Motion.header>
    )
}

export default Header;