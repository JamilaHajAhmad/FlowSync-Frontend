import React, { useState, useRef, useEffect } from "react";
import { 
    Box,
    Typography,
    IconButton,
    TextField,
    Paper,
    Avatar,
    Grow
} from "@mui/material";
import { Send as SendIcon, SmartToy } from "@mui/icons-material";
import { sendMessageToAI } from "./ChatbotAPI"; 
import LoadingDots from './LoadingDots';

const ChatbotWindow = ({ open }) => {
    const [messages, setMessages] = useState([
        { text: "Hello! How can I assist you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const botReply = await sendMessageToAI(input);
            setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { 
                text: "Sorry, I couldn't process your request.", 
                sender: "bot" 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Grow in={open} mountOnEnter unmountOnExit timeout={1000} style={{ transformOrigin: 'bottom right' }}>
            <Paper
                elevation={6}
                sx={{
                    position: "fixed",
                    bottom: 80,
                    right: 20,
                    width: 380,
                    maxHeight: "calc(100vh - 160px)",
                    height: 500,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    zIndex: 1001,
                    backgroundColor: '#FFFFFF',
                    transition: 'transform 0.4s ease-in-out',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: "#fff",
                    }}
                >
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                        <SmartToy />
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="h6" fontWeight={600}>
                            FlowSync Assistant
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Always here to help
                        </Typography>
                    </Box>
                </Box>

                {/* Messages Area */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        bgcolor: '#f8fafc',
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: '3px' }
                    }}
                >
                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                gap: 1
                            }}
                        >
                            {msg.sender === "bot" && (
                                <Avatar 
                                    sx={{ width: 32, height: 32, bgcolor: '#059669' }}
                                >
                                    <SmartToy sx={{ fontSize: 18 }} />
                                </Avatar>
                            )}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    maxWidth: "70%",
                                    backgroundColor: msg.sender === "user" ? '#059669' : '#fff',
                                    color: msg.sender === "user" ? '#fff' : 'inherit',
                                    border: msg.sender === "bot" ? '1px solid #e2e8f0' : 'none'
                                }}
                            >
                                <Typography variant="body2">{msg.text}</Typography>
                            </Paper>
                        </Box>
                    ))}
                    {isLoading && (
                        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
                            <Paper elevation={0} sx={{ p: 1, borderRadius: 2, backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
                                <LoadingDots />
                            </Paper>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: "1px solid #e2e8f0",
                        bgcolor: '#fff'
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        InputProps={{
                            endAdornment: (
                                <IconButton 
                                    onClick={handleSendMessage}
                                    sx={{ color: '#059669', '&:hover': { bgcolor: 'rgba(5, 150, 105, 0.04)' } }}
                                >
                                    <SendIcon />
                                </IconButton>
                            ),
                            sx: {
                                '&.MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                                    '&.Mui-focused fieldset': { borderColor: '#059669' }
                                }
                            }
                        }}
                    />
                </Box>
            </Paper>
        </Grow>
    );
};

export default ChatbotWindow;


