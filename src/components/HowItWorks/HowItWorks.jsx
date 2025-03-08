import React from 'react';
import './HowItWorks.css';
import { motion as Motion } from 'framer-motion';
import { slideInFromRight } from '../../variants';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
    return (
        <section className="how-it-works" id='how-it-works'>
            <div className="container">
                <Motion.h2 variants={slideInFromRight}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}>How It Works</Motion.h2>
                <Motion.p className="intro"
                    variants={slideInFromRight}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}>FlowSync simplifies task and team management,
                    keeping your projects organized and your team aligned.</Motion.p>
                <div className="steps">
                    <Motion.div className="step"
                        variants={slideInFromRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}>
                        <i>📝</i>
                        <h3>Create & Assign Tasks</h3>
                        <p>Easily create tasks, set deadlines, and assign them to team members with just a few clicks.</p>
                    </Motion.div>
                    <Motion.div className="step"
                        variants={slideInFromRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}>
                        <i>📊</i>
                        <h3>Track Progress & Insights</h3>
                        <p>Get clear visual reports, monitor project milestones, and make data-driven decisions.</p>
                    </Motion.div>
                    <Motion.div className="step"
                        variants={slideInFromRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}>
                        <i>📱</i>
                        <h3>Stay Synced Anytime, Anywhere</h3>
                        <p>Access FlowSync on any device to stay updated and keep your team in sync from anywhere.</p>
                    </Motion.div>
                </div>
                <Motion.div
                    className="cta-button"
                    variants={slideInFromRight}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}><Link className='link' to="/register">Get Started Today</Link></Motion.div>
            </div>
        </section>
    )
}

export default HowItWorks