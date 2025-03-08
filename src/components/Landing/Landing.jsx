import React from 'react';
import Home from '../Home/Home';
import Features from '../Features/Features';
import HowItWorks from '../HowItWorks/HowItWorks';
import About from '../About/About';
import Footer from '../Footer/Footer';
import Quote from '../Quote/Quote';

const Landing = () => {
    return (
        <main className='landing'>
            <Home/>
            <Features/>
            <HowItWorks/>
            <About/>
            <Quote/>
            <Footer/>
        </main>
    )
}

export default Landing;