import React from 'react';
import Home from './components/Home/Home';
import Features from './components/Features/Features';
import HowItWorks from './components/HowItWorks/HowItWorks';
import About from './components/About/About';
import Footer from './components/Footer/Footer';
import Quote from './components/Quote/Quote';

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