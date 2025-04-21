import React, { useState, useRef, useEffect } from "react";
import { 
    Box,
    Typography,
    IconButton,
    TextField,
    Paper,
    Avatar,
    Grow,
    Tooltip
} from "@mui/material";
import { 
    Send as SendIcon, 
    SmartToy,
    ThumbUp,
    ThumbDown,
    ContentCopy,
    VolumeUp,
    RestartAlt, // Add this import
    VolumeOff,
    Stop // Add this import
} from "@mui/icons-material";
import { toast } from 'react-toastify';
import { sendMessageToAI } from "./ChatbotAPI"; 
import LoadingDots from './LoadingDots';

const ChatbotWindow = ({ open }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [copyTooltips, setCopyTooltips] = useState({}); // Add state for copy tooltip per message
    const [speakingMessageId, setSpeakingMessageId] = useState(null); // Add state for tracking speech
    const [isFirstOpen, setIsFirstOpen] = useState(true); // Modify the initial state to track if it's first open
    const messagesEndRef = useRef(null);

    const messageSound = new Audio('/sounds/message-send.mp3');
    const replySound = new Audio('/sounds/message-received.mp3');

    const playSound = (sound) => {
        if (!isMuted) {
            sound.play().catch(error => console.error('Error playing sound:', error));
        }
    };

    useEffect(() => {
        if (open && isFirstOpen) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                const welcomeMessage = {
                    type: 'bot',
                    content: "Hello! How can I assist you today?",
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    likes: 0,
                    dislikes: 0
                };
                setMessages([welcomeMessage]);
                setIsLoading(false);
                setIsFirstOpen(false);
                playSound(replySound);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [open, isFirstOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        playSound(messageSound);

        const userMessage = {
            type: 'user',
            content: input,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const botReplies = await sendMessageToAI(input);
            setMessages(prev => [...prev, ...botReplies]);
            playSound(replySound);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: "Sorry, I couldn't process your request.",
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                likes: 0,
                dislikes: 0
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

    const handleReaction = (messageId, type) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                if (type === 'like') {
                    return { 
                        ...msg, 
                        likes: msg.likes === 1 ? 0 : 1,
                        dislikes: 0 // Reset dislike when liking
                    };
                } else {
                    return { 
                        ...msg, 
                        dislikes: msg.dislikes === 1 ? 0 : 1,
                        likes: 0 // Reset like when disliking
                    };
                }
            }
            return msg;
        }));
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true // Change to true for AM/PM
        });
    };

    const formatContent = (content) => {
        return content.split('\n').map((line, i) => {
            // Handle bold text (replacing **text** with styled spans)
            const formattedLine = line.replace(
                /\*\*(.*?)\*\*/g,
                (match, text) => (
                    `<span style="font-weight: 700">${text}</span>`
                )
            );

            return (
                <React.Fragment key={i}>
                    <div dangerouslySetInnerHTML={{ __html: formattedLine }} />
                    {i !== content.split('\n').length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    const handleCopy = async (messageId, content) => { // Update handleCopy function
        try {
            await navigator.clipboard.writeText(content);
            setCopyTooltips(prev => ({ ...prev, [messageId]: true }));
            setTimeout(() => {
                setCopyTooltips(prev => ({ ...prev, [messageId]: false }));
            }, 1500);
        } catch (err) {
            console.error('Copy failed:', err);
            toast.error('Failed to copy message');
        }
    };

    const handleSpeech = (messageId, content) => {
        if (speakingMessageId === messageId) {
            // Stop speaking
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
        } else {
            // Start speaking
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(content);
            utterance.onend = () => setSpeakingMessageId(null);
            window.speechSynthesis.speak(utterance);
            setSpeakingMessageId(messageId);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setIsLoading(true);
        setIsFirstOpen(true);
        
        const timer = setTimeout(() => {
            const welcomeMessage = {
                type: 'bot',
                content: "Hello! How can I assist you today?",
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                likes: 0,
                dislikes: 0
            };
            setMessages([welcomeMessage]);
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
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
                        p: 2,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: "#fff",
                    }}
                >
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2 }}>
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
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip 
                            title={isMuted ? "Unmute sounds" : "Mute sounds"}
                            arrow
                            placement="bottom"
                        >
                            <IconButton 
                                onClick={() => setIsMuted(!isMuted)}
                                sx={{ 
                                    color: 'white',
                                    padding: 1,
                                    '& svg': { fontSize: 20 }
                                }}
                            >
                                {isMuted ? <VolumeOff /> : <VolumeUp />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip 
                            title="Clear chat"
                            arrow
                            placement="bottom"
                        >
                            <IconButton 
                                onClick={handleClearChat}
                                sx={{ 
                                    color: 'white',
                                    padding: 1,
                                    '& svg': { fontSize: 20 },
                                    '&:hover': { 
                                        bgcolor: 'rgba(255, 255, 255, 0.1)' 
                                    }
                                }}
                            >
                                <RestartAlt />
                            </IconButton>
                        </Tooltip>
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
                    {messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                display: "flex",
                                justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                                gap: 1
                            }}
                        >
                            {msg.type === "bot" && (
                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#059669' }}>
                                    <SmartToy sx={{ fontSize: 16 }} />
                                </Avatar>
                            )}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    maxWidth: "70%",
                                    backgroundColor: msg.type === "user" ? '#059669' : '#fff',
                                    color: msg.type === "user" ? '#fff' : 'inherit',
                                    border: msg.type === "bot" ? '1px solid #e2e8f0' : 'none',
                                    whiteSpace: 'pre-wrap' // Add this for preserving formatting
                                }}
                            >
                                <Typography 
                                    variant="body2" 
                                    component="div"
                                    sx={{ 
                                        lineHeight: 1.6,
                                        '& code': {
                                            backgroundColor: msg.type === "user" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                                            padding: '2px 4px',
                                            borderRadius: 1,
                                            fontFamily: 'monospace'
                                        },
                                        '& span': {
                                            display: 'inline',
                                        }
                                    }}
                                >
                                    {formatContent(msg.content)}
                                </Typography>
                                <Box sx={{ 
                                    mt: 0.5, 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                    {msg.type === "bot" && (
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Like">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleReaction(msg.id, 'like')}
                                                    sx={{ 
                                                        padding: 0.5,
                                                        color: msg.likes > 0 ? '#059669' : 'inherit'
                                                    }}
                                                >
                                                    <ThumbUp sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Dislike">
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleReaction(msg.id, 'dislike')}
                                                    sx={{ 
                                                        padding: 0.5,
                                                        color: msg.dislikes > 0 ? '#dc2626' : 'inherit'
                                                    }}
                                                >
                                                    <ThumbDown sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip 
                                                title={copyTooltips[msg.id] ? "Copied!" : "Copy message"}
                                                open={copyTooltips[msg.id]}
                                                placement="bottom"
                                            >
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleCopy(msg.id, msg.content)}
                                                    sx={{ padding: 0.5 }}
                                                >
                                                    <ContentCopy sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={speakingMessageId === msg.id ? "Stop reading" : "Read aloud"}>
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleSpeech(msg.id, msg.content)}
                                                    sx={{ 
                                                        padding: 0.5,
                                                        color: speakingMessageId === msg.id ? '#dc2626' : 'inherit'
                                                    }}
                                                >
                                                    {speakingMessageId === msg.id ? (
                                                        <Stop sx={{ fontSize: 14 }} />
                                                    ) : (
                                                        <VolumeUp sx={{ fontSize: 14 }} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: msg.type === "user" ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </Typography>
                                </Box>
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


