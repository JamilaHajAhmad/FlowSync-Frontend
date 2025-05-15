import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import aboutImg from '../../../../assets/images/about.png';
import { motion as Motion } from 'framer-motion';
import { imageMotion, fadeUp } from '../../../../variants';

const About = () => {
    return (
        <section className="about" id='about'>
            <Motion.div className="about-container"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}>
                <div className="about-text">
                    <h2>About FlowSync</h2>
                    <p>
                        FlowSync is a powerful team and task management platform designed to help
                        teams collaborate seamlessly, track progress efficiently, and stay organized—no matter where they are.
                    </p>
                    <ul className="highlights">
                        <li>✅ <strong>Effortless Team Collaboration</strong> - Assign tasks, track progress, and communicate in real-time.</li>
                        <li>✅ <strong>Smart Notifications</strong> - Never miss a deadline with intelligent alerts and reminders.</li>
                        <li>✅ <strong>Secure & Reliable</strong> - Your data is safe with top-tier security measures.</li>
                    </ul>
                    <Link to="/register" className="cta-button">Get Started</Link>
                </div>
                <div className="about-image">
                    <Motion.img src={aboutImg}
                        variants={imageMotion}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        alt="Team collaboration" />
                </div>
            </Motion.div>
        </section>
    )
}

export default About;