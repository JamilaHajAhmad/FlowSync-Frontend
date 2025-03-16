import React from 'react'
import './Quote.css';
import { motion as Motion } from 'framer-motion';
import { backgroundMotion, quoteMotion, authorMotion } from '../../../../variants';

const Quote = () => {
    return (
        <Motion.section className="quote"
            variants={backgroundMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}>
            <Motion.h2
                variants={quoteMotion}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                "Great teams don't just work— <span>they flow.</span>"
            </Motion.h2>
            <Motion.p
                variants={authorMotion}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                - FlowSync Team
            </Motion.p>
        </Motion.section>
    )
}

export default Quote;