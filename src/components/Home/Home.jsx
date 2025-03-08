import React from 'react';
import Header from '../Header/Header';
import Logo from '../../assets/images/logo.png';
import './Home.css';
import { backgroundMotion, imageMotion, heroTitleMotion } from '../../variants';
import { motion as Motion } from 'framer-motion';

const Home = () => {
    return (
        <Motion.section className='home'
            id='home'
            variants={backgroundMotion}
            initial="hidden"
            animate="visible">
            <Header />
            <div className="hero">
                <div className="content">
                    <h1>100<small>%</small></h1>
                    <Motion.h2 variants={heroTitleMotion}>
                        <span>Streamline</span>
                        <span>Sync</span>
                        <span>Achieve</span>
                    </Motion.h2>
                </div>
                <Motion.div className="image"
                variants={imageMotion}>
                    <img src={Logo} alt="Logo" />
                </Motion.div>
            </div>
        </Motion.section>
    )
}

export default Home;