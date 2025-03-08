import React from 'react';
import './Footer.css';
import logo from '../../assets/images/logo.png';
import facebook from '../../assets/images/facebook.png';
import linkedin from '../../assets/images/linkedin.png';
import x from '../../assets/images/x.png';
import { motion as Motion } from 'framer-motion';
import { scaleUp } from '../../variants';
import { scrollIntoSection } from '../../utils';

const Footer = () => {
    return (
        <Motion.footer className="footer"
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}>
            <div className="footer-container">
                <div className="footer-brand">
                    <img src={logo} alt="FlowSync Logo" className="footer-logo" />
                    <p>Boost team collaboration with seamless task management.</p>
                </div>
                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li onClick={() => scrollIntoSection("home")}><a href="#home">Home</a></li>
                        <li onClick={() => scrollIntoSection("features")}><a href="#features">Features</a></li>
                        <li onClick={() => scrollIntoSection("how-it-works")}><a href="#how-it-works">How It Works</a></li>
                        <li onClick={() => scrollIntoSection("about")}><a href="#about">About</a></li>
                    </ul>
                </div>
                <div className="footer-support">
                    <h3>Support</h3>
                    <ul>
                        <li><a href="/help">Help Center</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                    </ul>
                </div>
                <div className="footer-newsletter">
                    <h3>Stay Updated</h3>
                    <p>Subscribe to get the latest updates and news.</p>
                    <form>
                        <input type="email" placeholder="Enter your email" required />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} FlowSync. All rights reserved.</p>
                <div className="social-icons">
                    <a href="https://facebook.com"><img src={facebook} alt="Facebook" /></a>
                    <a href="https://x.com"><img src={x} alt="Twitter-X" /></a>
                    <a href="https://linkedin.com"><img src={linkedin} alt="LinkedIn" /></a>
                </div>
            </div>
        </Motion.footer>
    )
}

export default Footer;