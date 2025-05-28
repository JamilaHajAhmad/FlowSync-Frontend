import { motion as Motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../../variants';
import logo from '../../../../assets/images/logo.png';
import './Support.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PrivacyPolicy = () => {
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
                <h1>Privacy Policy</h1>
                <p>Last updated: May 2025</p>
            </Motion.div>

            <Motion.div className="policy-content" variants={itemVariants}>
                <section>
                    <h2>Information We Collect</h2>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul>
                        <li>Account information (name, email, password)</li>
                        <li>Professional information (team role, department)</li>
                        <li>Task-related content and communications</li>
                        <li>Usage data and activity logs</li>
                        <li>Device and browser information</li>
                    </ul>
                </section>

                <section>
                    <h2>How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide and maintain our task management services</li>
                        <li>Process and manage your tasks and team interactions</li>
                        <li>Send important updates and notifications</li>
                        <li>Analyze and improve our platform's performance</li>
                        <li>Ensure platform security and prevent fraud</li>
                    </ul>
                </section>

                <section>
                    <h2>Data Security</h2>
                    <p>We implement robust security measures to protect your information:</p>
                    <ul>
                        <li>Encrypted data transmission using SSL/TLS protocols</li>
                        <li>Secure data storage with regular backups</li>
                        <li>Access controls and authentication measures</li>
                        <li>Regular security audits and updates</li>
                    </ul>
                </section>

                <section>
                    <h2>Data Retention</h2>
                    <p>We retain your information for as long as:</p>
                    <ul>
                        <li>Your account remains active</li>
                        <li>Required by law or regulations</li>
                        <li>Necessary for legitimate business purposes</li>
                    </ul>
                </section>

                <section>
                    <h2>Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal information</li>
                        <li>Request corrections to your data</li>
                        <li>Request deletion of your account</li>
                        <li>Opt-out of non-essential communications</li>
                    </ul>
                </section>

                <section className="contact-section">
                    <h2>Questions or Concerns?</h2>
                    <p>If you have any questions about this Privacy Policy or our practices, please contact our Support Team:</p>
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

export default PrivacyPolicy;