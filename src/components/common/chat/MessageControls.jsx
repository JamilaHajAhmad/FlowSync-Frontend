import React from 'react';
import { FaThumbsUp, FaThumbsDown, FaVolumeUp, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { speakMessage } from './ChatbotAPI';
import './MessageControls.css'; // Assuming you have a CSS file for styles

const MessageControls = ({ message, onLike, onDislike }) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            toast.success('Message copied to clipboard!');
        } catch (err) {
            toast.error(err.message || 'Failed to copy message');
        }
    };

    const handleSpeak = () => {
        speakMessage(message.content);
    };

    return (
        <div className="message-controls">
            <button 
                onClick={() => onLike(message.id)}
                className={`control-btn ${message.likes > 0 ? 'active' : ''}`}
            >
                <FaThumbsUp /> {message.likes > 0 && message.likes}
            </button>
            <button 
                onClick={() => onDislike(message.id)}
                className={`control-btn ${message.dislikes > 0 ? 'active' : ''}`}
            >
                <FaThumbsDown /> {message.dislikes > 0 && message.dislikes}
            </button>
            <button onClick={handleSpeak} className="control-btn">
                <FaVolumeUp />
            </button>
            <button onClick={handleCopy} className="control-btn">
                <FaCopy />
            </button>
        </div>
    );
};

export default MessageControls;