import React from 'react'
import './Quote.css';
import { motion as Motion } from 'framer-motion';
import { backgroundMotion } from '../../variants';

const Quote = () => {
    return (
        <Motion.section className="quote"
            variants={backgroundMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}>
            <div className="quote-overlay">
                <h2>"Great teams don’t just work— <span>they flow.</span>"</h2>
                <p>- FlowSync Team</p>
            </div>
        </Motion.section>
    )
}

export default Quote;