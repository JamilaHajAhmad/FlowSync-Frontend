import Header from '../Header/Header';
import Logo from '../../../../assets/images/logo.png';
import './Home.css';
import { backgroundMotion, logoMotion, contentMotion } from '../../../../variants';
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
                <Motion.div
                    className="content"
                    variants={contentMotion}
                    initial="hidden"
                    animate="visible"
                >
                    <h1>100<small>%</small></h1>
                    <h2>
                        Streamline
                        <br />
                        Sync
                        <br />
                        Achieve
                    </h2>
                </Motion.div>
                <Motion.div
                    className="image"
                    variants={logoMotion}
                    initial="hidden"
                    animate="visible"
                >
                    <img src={Logo} alt="Logo" />
                </Motion.div>
            </div>
        </Motion.section>
    )
}

export default Home;