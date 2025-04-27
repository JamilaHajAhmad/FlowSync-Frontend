import React, { useState } from 'react';
import { Fab, Zoom } from '@mui/material';
import { Chat, Close } from '@mui/icons-material';
import ChatbotWindow from './ChatbotWindow';

const ChatbotButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <>
            <Zoom in={true}>
                <Fab
                    color="primary"
                    aria-label="chat"
                    onClick={handleToggle}
                    sx={{
                        position: 'fixed',
                        bottom: 40,
                        right: 16,
                        bgcolor: '#059669',
                        '&:hover': {
                            bgcolor: '#047857'
                        },
                        transition: 'all 0.3s ease-in-out',
                        transform: isOpen ? 'rotate(360deg)' : 'rotate(0)',
                    }}
                >
                    {isOpen ? <Close /> : <Chat />}
                </Fab>
            </Zoom>
            <ChatbotWindow 
                open={isOpen} 
                onClose={() => setIsOpen(false)} 
            />
        </>
    );
};

export default ChatbotButton;
