import { useState, useEffect } from 'react';
import { Fab, Zoom } from '@mui/material';
import { Chat, Close } from '@mui/icons-material';
import ChatbotWindow from './ChatbotWindow';

const ChatbotButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOnChatPage, setIsOnChatPage] = useState(false);

    useEffect(() => {
        const checkLocation = () => {
            const pathname = window.location.pathname;
            setIsOnChatPage(pathname === '/chat' || pathname.startsWith('/chat/'));
        };

        // Check initially
        checkLocation();

        // Listen for route changes (if using browser navigation)
        window.addEventListener('popstate', checkLocation);
        
        // For SPA route changes, you might need a custom event or interval
        const interval = setInterval(checkLocation, 1000);

        return () => {
            window.removeEventListener('popstate', checkLocation);
            clearInterval(interval);
        };
    }, []);

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
                        bottom: 10,
                        ...(isOnChatPage ? {
                            left: 10
                        } : {
                            right: 10
                        }),
                        bgcolor: '#059669',
                        '&:hover': {
                            bgcolor: '#047857'
                        },
                        transition: 'all 0.3s ease-in-out',
                        transform: isOpen ? 'rotate(360deg)' : 'rotate(0)',
                        zIndex: 1000,
                    }}
                >
                    {isOpen ? <Close /> : <Chat />}
                </Fab>
            </Zoom>
            <ChatbotWindow 
                open={isOpen}
                onClose={() => setIsOpen(false)}
                isOnChatPage={isOnChatPage}
            />
        </>
    );
};

export default ChatbotButton;