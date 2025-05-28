import { motion as Motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../../variants';
import logo from '../../../../assets/images/logo.png';
import './Support.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <Motion.div
            className="support-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <button 
                className="back-button"
                onClick={() => navigate('/')}
            >
                <ArrowBackIcon /> Back to Home
            </button>

            <Motion.div className="help-header" variants={itemVariants}>
                <img src={logo} alt="FlowSync Logo" className="help-logo" />
                <h1>Terms of Service</h1>
                <p>Last updated: May 2025</p>
            </Motion.div>

            <Motion.div className="terms-content" variants={itemVariants}>
                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using FlowSync, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                </section>

                <section>
                    <h2>2. Account Registration</h2>
                    <p>To use FlowSync, you must:</p>
                    <ul>
                        <li>Be a member of Dubai Police</li>
                        <li>Provide accurate and complete registration information</li>
                        <li>Maintain the confidentiality of your account credentials</li>
                        <li>Notify us immediately of any unauthorized access</li>
                    </ul>
                </section>

                <section>
                    <h2>3. User Responsibilities</h2>
                    <ul>
                        <li>Use the platform in accordance with applicable laws and regulations</li>
                        <li>Maintain appropriate security measures for your account</li>
                        <li>Report any suspicious activities or security breaches</li>
                        <li>Keep your contact information up to date</li>
                        <li>Use the platform for its intended purpose only</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Prohibited Activities</h2>
                    <p>Users must not:</p>
                    <ul>
                        <li>Share account credentials with unauthorized users</li>
                        <li>Upload malicious software or content</li>
                        <li>Attempt to bypass platform security measures</li>
                        <li>Use the platform for unauthorized purposes</li>
                        <li>Share sensitive or classified information inappropriately</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Intellectual Property</h2>
                    <p>All content and materials available on FlowSync are property of Dubai Police and protected by applicable intellectual property laws. Users agree to:</p>
                    <ul>
                        <li>Respect all copyright and proprietary notices</li>
                        <li>Not copy, modify, or distribute platform content without authorization</li>
                        <li>Use materials only as expressly permitted</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Service Modifications</h2>
                    <p>We reserve the right to:</p>
                    <ul>
                        <li>Modify or discontinue any part of our services</li>
                        <li>Update these terms with reasonable notice</li>
                        <li>Suspend accounts that violate these terms</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Limitation of Liability</h2>
                    <p>FlowSync is provided "as is" without warranties of any kind. We are not liable for:</p>
                    <ul>
                        <li>Service interruptions or data loss</li>
                        <li>Indirect or consequential damages</li>
                        <li>User-generated content or actions</li>
                    </ul>
                </section>

                <section className="contact-section">
                    <h2>Contact Us</h2>
                    <p>If you have questions about these Terms of Service, please contact us:</p>
                    <div className="contact-info">
                        <p>Email: <a href="mailto:flowsync2027@outlook.com">flowsync2027@outlook.com</a></p>
                        <p>Response Time: Within 24-48 hours</p>
                        <button 
                            className="contact-button"
                            onClick={() => window.location.href = '/help'}
                        >
                            Visit Help Center
                        </button>
                    </div>
                </section>
            </Motion.div>
        </Motion.div>
    );
};

export default TermsOfService;