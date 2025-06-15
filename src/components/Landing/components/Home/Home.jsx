import Header from '../Header/Header';
import Logo from '../../../../assets/images/logo.png';
import './Home.css';
import { backgroundMotion, logoMotion, contentMotion } from '../../../../variants';
import { motion as Motion } from 'framer-motion';

const Home = () => {
    return (
        <Motion.section 
            className='home'
            id='home'
            variants={backgroundMotion}
            initial="hidden"
            animate="visible"
        >
            <Header />
            <div className="hero">
                <div className="hero-grid">
                    <Motion.div
                        className="content-card"
                        variants={contentMotion}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="percentage">
                            <h1>100<small>%</small></h1>
                        </div>
                        <h2>
                            Streamline
                            <br />
                            Sync
                            <br />
                            Achieve
                        </h2>
                    </Motion.div>
                    <Motion.div
                        className="logo-card"
                        variants={logoMotion}
                        initial="hidden"
                        animate="visible"
                    >
                        <img src={Logo} alt="Logo" className='image'/>
                    </Motion.div>
                </div>
            </div>
        </Motion.section>
    )
}

export default Home;