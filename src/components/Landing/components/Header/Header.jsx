import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { navbarMotion } from '../../../../variants';
import { motion as Motion } from 'framer-motion';
import { scrollIntoSection } from '../../../../utils';

const Header = () => {
    return (
        <Motion.header variants={navbarMotion} 
        initial="hidden" 
        animate="visible">
            <h1 className='logo'>FlowSync</h1>
            <nav className="links">
                <ul>
                    <li onClick={() => scrollIntoSection("home")}><a href="#home" className="link">Home</a></li>
                    <li onClick={() => scrollIntoSection("features")}><a href="#features" className="link">Features</a></li>
                    <li onClick={() => scrollIntoSection("how-it-works")}><a href="#how-it-works" className="link">How It Works</a></li>
                    <li onClick={() => scrollIntoSection("about")}><a href="#about" className="link">About</a></li>
                    <Link to="/register" className='sign-up'>Sign Up</Link>
                    <Link to="/login" className='log-in'>Log in</Link>
                </ul>
            </nav>
        </Motion.header>
    )
}

export default Header;