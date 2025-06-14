import './Features.css';
import { motion as Motion } from 'framer-motion';
import { slideInFromLeft } from '../../../../variants';

const Features = () => {
    return (
        <Motion.section className="features"
            id='features'>
            <Motion.h2 className="title"
                variants={slideInFromLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >Powerful Features to Boost Your Team’s Productivity</Motion.h2>
            <div className="features-grid">
                <Motion.div className="feature"
                    variants={slideInFromLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}>
                    <div className="icon">📝</div>
                    <h3>Task Management</h3>
                    <p>Easily create, assign, and track tasks in one place.</p>
                </Motion.div>
                <Motion.div className="feature"
                    variants={slideInFromLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}>
                    <div className="icon">📊</div>
                    <h3>Progress Tracking</h3>
                    <p>Get clear insights with charts, dashboards, and reports.</p>
                </Motion.div>
                <Motion.div className="feature"
                    variants={slideInFromLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}>
                    <div className="icon">🔔</div>
                    <h3>Smart Notifications</h3>
                    <p>Stay updated with customizable alerts and reminders.</p>
                </Motion.div>
            </div>
        </Motion.section>
    )
}

export default Features;