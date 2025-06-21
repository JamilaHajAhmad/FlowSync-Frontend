import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { containerVariants, itemVariants } from '../../../../variants';
import logo from '../../../../assets/images/logo.png';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import './Support.css';

const HelpCenter = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    React.useEffect(() => {
        document.title = "FlowSync | Help Center";
    }, []);

    const faqs = [
        {
            question: "What is FlowSync?",
            answer: "FlowSync is a comprehensive task management platform designed to help Dubai Police teams collaborate efficiently. It offers features like task tracking, team communication, and task management tools."
        },
        {
            question: "How do I create a new task?",
            answer: "Creation of task is authorized for the team leader only. To create a new task, navigate to your dashboard,to Tasks page and then click the 'Create New Task' button, fill in the task details including title, FRN, priority, and OSS, then click 'Create'."
        },
        {
            question: "How do I manage team permissions?",
            answer: "As a team leader, you will control requests for joining the platform, freezing the tasks, completing them, change the status of the member and delete his account."
        },
        {
            question: "How do I track task progress?",
            answer: "You can track task progress through the dashboard's progress bars, status updates, and performance metrics. The KPI section provides detailed insights into task completion rates."
        },
        {
            question: "Can I integrate FlowSync with other tools?",
            answer: "Currently, FlowSync does not support third-party integrations. However, we are continuously working to enhance our platform and may include this feature in future updates."
        },
        {
            question: "How do I contact support?",
            answer: "For any issues or questions, you can reach out to our support team via email at flowsync2027@outlook.com"
        }
    ];

    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return faqs;
        
        const query = searchQuery.toLowerCase();
        return faqs.filter(faq => 
            faq.question.toLowerCase().includes(query) || 
            faq.answer.toLowerCase().includes(query)
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <Motion.div
            className="support-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <button 
                className="back-button"
                onClick={() => navigate('/')}
            >
                <ArrowBackIcon /> Back to Home
            </button>

            <Motion.div className="help-header" variants={itemVariants}>
                <img src={logo} alt="FlowSync Logo" className="help-logo" />
                <h1>FlowSync Help Center</h1>
                <p>Get the support you need to make the most of FlowSync</p>
            </Motion.div>

            <Motion.div className="help-search" variants={itemVariants}>
                <div className="search-container">
                    <SearchIcon className="search-icon" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for help articles..." 
                        className="search-input"
                    />
                    {searchQuery && (
                        <button 
                            className="clear-search"
                            onClick={handleClearSearch}
                            aria-label="Clear search"
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>
            </Motion.div>

            <Motion.div className="help-sections" variants={itemVariants}>
                <section className="help-section faq-section">
                    <h2>Frequently Asked Questions</h2>
                    {filteredFaqs.length === 0 ? (
                        <div className="no-results">
                            <p>No results found for "{searchQuery}"</p>
                            <button onClick={handleClearSearch}>Clear Search</button>
                        </div>
                    ) : (
                        <div className="faq-grid">
                            {filteredFaqs.map((faq, index) => (
                                <div key={index} className="faq-item">
                                    <h3>{faq.question}</h3>
                                    <p>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="help-section contact-section">
                    <h2>Need More Help?</h2>
                    <div className="contact-options">
                        <div className="contact-card">
                            <h3>Email Support</h3>
                            <p>flowsync2027@outlook.com</p>
                            <p className="support-hours">Available 24/7</p>
                        </div>
                        <div className="contact-card">
                            <h3>Live Chat</h3>
                            <p>Chat with our support team</p>
                            <p className="support-hours">Monday - Friday, 9:00 AM - 5:00 PM EST</p>
                        </div>
                    </div>
                </section>
            </Motion.div>
        </Motion.div>
    );
};

export default HelpCenter;