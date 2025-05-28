import './Footer.css';
import logo from '../../../../assets/images/logo.png';
import facebook from '../../../../assets/images/facebook.png';
import linkedin from '../../../../assets/images/linkedin.png';
import x from '../../../../assets/images/x.png';
import { motion as Motion } from 'framer-motion';
import { itemVariants, containerVariants } from '../../../../variants';
import { scrollIntoSection } from '../../../../utils';
import { useState } from 'react';
import axios from 'axios';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await axios.post('https://localhost:49798/api/subscribe', { email });
            setSubscribed(true);
            setEmail('');
        } catch (error) {
            if (error.response?.status === 400) {
                setError(error.response.data.errors?.Email?.[0] || 'Invalid email format');
            } else {
                setError('Something went wrong. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="footer">
            <Motion.div 
                className="footer-container"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}>
                <Motion.div className="footer-brand" variants={itemVariants}>
                    <img src={logo} alt="FlowSync Logo" className="footer-logo" />
                    <p>Boost team collaboration with seamless task management.</p>
                </Motion.div>
                <Motion.div className="footer-links" variants={itemVariants}>
                    <h3>Quick Links</h3>
                    <ul>
                        <li onClick={() => scrollIntoSection("home")}><a href="#home">Home</a></li>
                        <li onClick={() => scrollIntoSection("features")}><a href="#features">Features</a></li>
                        <li onClick={() => scrollIntoSection("how-it-works")}><a href="#how-it-works">How It Works</a></li>
                        <li onClick={() => scrollIntoSection("about")}><a href="#about">About</a></li>
                    </ul>
                </Motion.div>
                <Motion.div className="footer-support" variants={itemVariants}>
                    <h3>Support</h3>
                    <ul>
                        <li><a href="/help">Help Center</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                    </ul>
                </Motion.div>
                <Motion.div className="footer-newsletter" variants={itemVariants}>
                    <h3>Stay Updated</h3>
                    <p>Subscribe to get the latest updates and news.</p>
                    {subscribed ? (
                        <p className="success-message">Thank you for subscribing!</p>
                    ) : (
                        <form onSubmit={handleSubscribe}>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email" 
                                required 
                            />
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </button>
                            {error && <p className="error-message">{error}</p>}
                        </form>
                    )}
                </Motion.div>
            </Motion.div>
            <Motion.div 
                className="footer-bottom"
                variants={itemVariants}>
                <p>© {new Date().getFullYear()} FlowSync. All rights reserved.</p>
                <div className="social-icons">
                    <a href="https://facebook.com"><img src={facebook} alt="Facebook" /></a>
                    <a href="https://x.com"><img src={x} alt="Twitter-X" /></a>
                    <a href="https://linkedin.com"><img src={linkedin} alt="LinkedIn" /></a>
                </div>
            </Motion.div>
        </footer>
    )
}

export default Footer;