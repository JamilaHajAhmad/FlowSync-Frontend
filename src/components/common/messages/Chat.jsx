import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Badge,
    Chip,
    Skeleton,
    Alert,
    Snackbar,
    ThemeProvider,
    createTheme,
    Tooltip,
    Popper,
    ClickAwayListener
} from '@mui/material';
import {
    Send as SendIcon,
    Circle as UnreadIcon,
    CheckCircle as DeliveredIcon,
    Schedule as PendingIcon,
    Check as CheckIcon,
    People as TeamIcon,
    ArrowBack,
    InsertEmoticon as EmojiIcon
} from '@mui/icons-material';
import { sendMessage, getConversation, getUnreadMessages, markMessagesAsRead, getChatUsers, sendMessageToTeam } from '../../../services/chatService';
import * as signalR from '@microsoft/signalr';
import './Chat.css';
import Logo from '../../../assets/images/logo.png';
import { decodeToken } from '../../../utils';
import { toast } from 'react-toastify';
import TeamMessageDialog from './TeamMessageDialog';
import EmojiPicker from 'emoji-picker-react';

// Message status constants
const MESSAGE_STATUS = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed'
};

// Create a custom theme with green palette
const theme = createTheme({
    palette: {
        primary: {
            main: '#059669',
            light: '#ecfdf5',
            dark: '#047857',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#10b981',
            light: '#d1fae5',
            dark: '#065f46'
        },
        background: {
            default: '#f9fafb',
            paper: '#ffffff'
        }
    }
});

const Chat = () => {
    // State management
    const [ conversations, setConversations ] = useState([]);
    const [ selectedUser, setSelectedUser ] = useState(null);
    const [ messages, setMessages ] = useState([]);
    const [ newMessage, setNewMessage ] = useState('');
    const [ unreadCount, setUnreadCount ] = useState(0);
    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ connection, setConnection ] = useState(null);
    const [ connectionState, setConnectionState ] = useState('disconnected');
    const [ error, setError ] = useState(null);
    const [ isTyping, setIsTyping ] = useState(false);
    const [ isTeamMessage, setIsTeamMessage ] = useState(false);
    const [ isTeamMessageEnabled ] = useState(() => {
        const token = localStorage.getItem('authToken');
        try {
            // Decode the JWT token to get user role
            const role = decodeToken(token).role;
            return role === 'Leader';
        } catch (error) {
            console.log('Error decoding token:', error);
            return false;
        }
    });
    // Add new state for team message dialog
    const [ teamMessageDialog, setTeamMessageDialog ] = useState(false);
    const [ showEmojiPicker, setShowEmojiPicker ] = useState(false);
    const [ emojiAnchorEl, setEmojiAnchorEl ] = useState(null);

    // Refs
    const messageEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const conversationCacheRef = useRef(new Map());
    const selectedUserIdRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const textFieldRef = useRef(null);

    // Constants - moved to refs to prevent recreating on each render
    const tokenRef = useRef(localStorage.getItem('authToken'));
    const currentUserIdRef = useRef(decodeToken(tokenRef.current).id);

    // Find the current user object from users array
    const currentUser = useMemo(
        () => users.find(u => u.id === currentUserIdRef.current),
        [ users ]
    );

    // Update refs when selectedUser changes
    useEffect(() => {
        selectedUserIdRef.current = selectedUser?.id || null;
    }, [ selectedUser?.id ]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ messages, isTyping ]);

    // Memoized values
    const sortedUsers = useMemo(() => {
        return users.sort((a, b) => {
            // Sort by unread messages first, then by last message time
            const aHasUnread = conversations.some(conv => conv.userId === a.id && conv.unreadCount > 0);
            const bHasUnread = conversations.some(conv => conv.userId === b.id && conv.unreadCount > 0);

            if (aHasUnread && !bHasUnread) return -1;
            if (!aHasUnread && bHasUnread) return 1;

            // Sort by last message time (newest first)
            const aLastMessage = conversations.find(conv => conv.userId === a.id)?.lastMessageTime || 0;
            const bLastMessage = conversations.find(conv => conv.userId === b.id)?.lastMessageTime || 0;
            return new Date(bLastMessage) - new Date(aLastMessage);
        });
    }, [ users, conversations ]);

    // Stable callback functions using useCallback with proper dependencies
    const showError = useCallback((message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    }, []);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    // Format functions - stable callbacks
    const formatLastMessageTime = useCallback((timestamp) => {
        if (!timestamp) return '';

        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

        if (isNaN(messageDate.getTime())) return '';

        if (diffDays === 0) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return messageDate.toLocaleDateString([], { weekday: 'short' });
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }, []);

    const formatMessageTime = useCallback((timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';

            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'now';
            if (diffMins < 60) return `${diffMins}m`;
            if (diffHours < 24) return `${diffHours}h`;
            if (diffDays < 7) return `${diffDays}d`;

            return date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }, []);

    // Stable fetch functions
    const fetchUnreadMessages = useCallback(async () => {
        try {
            const response = await getUnreadMessages(tokenRef.current);
            setUnreadCount(response.data.length);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            if (error.response?.status === 401) {
                showError('Session expired. Please log in again.');
            }
        }
    }, [ showError ]);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await getUnreadMessages(tokenRef.current);
            const conversationsMap = response.data.reduce((acc, msg) => {
                if (!acc[ msg.senderId ]) {
                    acc[ msg.senderId ] = {
                        userId: msg.senderId,
                        unreadCount: 0,
                        lastMessage: msg.content,
                        lastMessageTime: msg.timestamp
                    };
                }
                acc[ msg.senderId ].unreadCount++;
                // Keep the latest message
                if (!acc[ msg.senderId ].lastMessageTime ||
                    new Date(msg.timestamp) > new Date(acc[ msg.senderId ].lastMessageTime)) {
                    acc[ msg.senderId ].lastMessage = msg.content;
                    acc[ msg.senderId ].lastMessageTime = msg.timestamp;
                }
                return acc;
            }, {});
            setConversations(Object.values(conversationsMap));
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await getChatUsers(tokenRef.current);
            console.log('Fetched users:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [ showError ]);

    const fetchConversation = useCallback(async (userId, fromCache = true) => {
        // Check cache first
        if (fromCache && conversationCacheRef.current.has(userId)) {
            const cachedData = conversationCacheRef.current.get(userId);
            if (Date.now() - cachedData.timestamp < 30000) { // 30 seconds cache
                setMessages(cachedData.messages);
                return;
            }
        }

        try {
            const response = await getConversation(userId, tokenRef.current);
            console.log('Fetched conversation:', response.data);

            let messagesData;

            if (Array.isArray(response.data)) {
                messagesData = response.data.map(msg => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content || msg.message,
                    timestamp: msg.timestamp || msg.sentAt,
                    isRead: msg.isRead,
                    isMine: msg.isMine,
                    status: msg.isMine ? MESSAGE_STATUS.DELIVERED : undefined
                }));
            } else if (response.data && Array.isArray(response.data.messages)) {
                messagesData = response.data.messages.map(msg => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content || msg.message,
                    timestamp: msg.timestamp || msg.sentAt,
                    isRead: msg.isRead,
                    isMine: msg.isMine,
                    status: msg.isMine ? MESSAGE_STATUS.DELIVERED : undefined
                }));
            } else {
                console.warn('Unexpected API response structure:', response.data);
                messagesData = [];
            }

            // Sort messages by timestamp to ensure correct order
            messagesData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            setMessages(messagesData);

            // Cache the conversation
            conversationCacheRef.current.set(userId, {
                messages: messagesData,
                timestamp: Date.now()
            });

            // Mark messages as read
            const unreadMessageIds = messagesData
                .filter(m => !m.isRead && !m.isMine)
                .map(m => m.id);

            if (unreadMessageIds.length > 0) {
                await markMessagesAsRead(unreadMessageIds, tokenRef.current);
                fetchUnreadMessages();
                fetchConversations();
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
            showError('Failed to load conversation');
        }
    }, [ fetchUnreadMessages, fetchConversations, showError ]);

    // Typing notification handler
    const sendTypingNotification = useCallback((isTypingValue) => {
        if (connection?.state === signalR.HubConnectionState.Connected && selectedUserIdRef.current) {
            connection.invoke("Typing", selectedUserIdRef.current, isTypingValue)
                .catch(err => {
                    console.error('Error sending typing notification:', err);
                    if (!err.message.includes("Method does not exist")) {
                        showError('Failed to send typing notification');
                    }
                });
        }
    }, [ connection, showError ]);

    const handleTyping = useCallback(() => {
        sendTypingNotification(true);

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingNotification(false);
        }, 1000);
    }, [ sendTypingNotification ]);

    // Message sending with optimistic updates - REST API only
    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setNewMessage('');

        // Handle team message
        if (isTeamMessage && isTeamMessageEnabled) {
            try {
                await sendMessageToTeam(messageContent, tokenRef.current);
                toast.success('Team message sent successfully');
                setIsTeamMessage(false);
            } catch (error) {
                console.error('Error sending team message:', error);
                showError('Failed to send team message');
            }
            return;
        }

        // Handle direct message
        if (!selectedUser) return;

        const isSelfMessage = selectedUser.id === currentUserIdRef.current;

        // Always do optimistic update - including for self messages
        const tempMessage = {
            id: tempId,
            senderId: currentUserIdRef.current,
            content: messageContent,
            timestamp: new Date().toISOString(),
            isRead: true,
            isMine: true,
            status: MESSAGE_STATUS.SENDING
        };

        setMessages(prev => [ ...prev, tempMessage ]);
        scrollToBottom();

        try {
            // Send via REST API only
            const response = await sendMessage(selectedUser.id, messageContent, tokenRef.current);
            const sentMessageId = response.data?.id || response.data?.messageId;

            // For self messages, don't update status here - let SignalR handle it
            // For other messages, update status as normal
            if (!isSelfMessage) {
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId
                        ? { ...msg, id: sentMessageId || tempId, status: MESSAGE_STATUS.DELIVERED }
                        : msg
                ));
            }

            // Clear cache for this conversation to force refresh
            conversationCacheRef.current.delete(selectedUser.id);

        } catch (error) {
            console.error('Error sending message:', error);

            // Update message status to failed for all messages (including self messages)
            setMessages(prev => prev.map(msg =>
                msg.id === tempId
                    ? { ...msg, status: MESSAGE_STATUS.FAILED }
                    : msg
            ));

            showError('Failed to send message. Please try again.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ newMessage, selectedUser, isTeamMessage, isTeamMessageEnabled, showError ]);


    // SignalR connection management - Fixed dependencies
    useEffect(() => {
        if (!tokenRef.current) return;

        let connection;
        let isMounted = true;

        const setupConnection = async () => {
            try {
                const newConnection = new signalR.HubConnectionBuilder()
                    .withUrl("https://localhost:49798/chatHub", {
                        accessTokenFactory: () => tokenRef.current,
                        skipNegotiation: true,
                        transport: signalR.HttpTransportType.WebSockets
                    })
                    .withAutomaticReconnect([ 0, 2000, 5000, 10000, 30000 ])
                    .configureLogging(signalR.LogLevel.Debug)
                    .build();

                // Add handlers
                newConnection.on("UserTyping", (userId, isTypingValue) => {
                    if (isMounted && selectedUserIdRef.current === userId) {
                        setIsTyping(isTypingValue);
                    }
                });

                // Updated SignalR event handler
                newConnection.on("ReceiveMessage", async (senderId, messageContent, messageId, timestamp, isMine) => {
                    if (!isMounted) return;

                    const isSelfMessage = senderId === currentUserIdRef.current;

                    // Skip if this is our own message that we just sent to someone else (it's already in the UI)
                    if (isMine && !isSelfMessage) return;

                    if (selectedUserIdRef.current === senderId) {
                        setMessages(prev => {
                            // For self messages, find and replace the temp message
                            if (isSelfMessage) {
                                const existingTempIndex = prev.findIndex(m =>
                                    m.content === messageContent &&
                                    m.senderId === senderId &&
                                    m.id.toString().startsWith('temp-')
                                );

                                if (existingTempIndex !== -1) {
                                    // Replace temp message with real message from server
                                    const newMessages = [ ...prev ];
                                    newMessages[ existingTempIndex ] = {
                                        id: messageId,
                                        senderId,
                                        content: messageContent,
                                        timestamp,
                                        isRead: true,
                                        isMine: true,
                                        status: MESSAGE_STATUS.DELIVERED
                                    };
                                    return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                }
                            }

                            // Check if message already exists to prevent duplicates
                            if (prev.some(m => m.id === messageId)) return prev;

                            // Add new message for non-self messages
                            const newMsg = {
                                id: messageId,
                                senderId,
                                content: messageContent,
                                timestamp,
                                isRead: selectedUserIdRef.current === senderId,
                                isMine
                            };

                            const newMessages = [ ...prev, newMsg ];
                            return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                        });

                        setTimeout(() => {
                            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);

                        try {
                            await markMessagesAsRead([ messageId ], tokenRef.current);
                        } catch (error) {
                            console.error('Error marking message as read:', error);
                        }
                    } else {
                        // Trigger refresh for unread messages and conversations
                        fetchUnreadMessages();
                        fetchConversations();
                    }
                });

                // Start connection
                await newConnection.start();

                if (isMounted) {
                    setConnectionState('connected');
                    setConnection(newConnection);
                    console.log("SignalR Connected");
                }

                // Connection state handlers
                newConnection.onreconnecting(() => {
                    if (isMounted) {
                        setConnectionState('reconnecting');
                    }
                });

                newConnection.onreconnected(() => {
                    if (isMounted) {
                        setConnectionState('connected');
                    }
                });

                newConnection.onclose(() => {
                    if (isMounted) {
                        setConnectionState('disconnected');
                    }
                });

                return newConnection;
            } catch (err) {
                console.error("SignalR Connection Error:", err);
                if (isMounted) {
                    setConnectionState('disconnected');
                }
                // Retry after delay
                await new Promise(resolve => setTimeout(resolve, 5000));
                return setupConnection();
            }
        };

        setupConnection().then(conn => {
            connection = conn;
        });

        return () => {
            isMounted = false;
            if (connection) {
                connection.off("UserTyping");
                connection.off("ReceiveMessage");
                connection.stop().catch(err => {
                    console.error('Error stopping connection:', err);
                });
            }
            clearTimeout(typingTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once

    // Initial data fetching effect - Fixed dependencies
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!isMounted) return;
            try {
                await Promise.all([
                    fetchUsers(),
                    fetchUnreadMessages(),
                    fetchConversations()
                ]);
            } catch (error) {
                console.error('Initial data fetch error:', error);
            }
        };

        fetchData();

        // Polling fallback with stable intervals
        const unreadInterval = setInterval(() => {
            if (isMounted) fetchUnreadMessages();
        }, 30000);

        const conversationsInterval = setInterval(() => {
            if (isMounted) fetchConversations();
        }, 60000);

        return () => {
            isMounted = false;
            clearInterval(unreadInterval);
            clearInterval(conversationsInterval);
        };
    }, [ fetchUsers, fetchUnreadMessages, fetchConversations ]);

    // Selected user effect - Modified to prevent message loss
    useEffect(() => {
        if (!selectedUser?.id) return;

        let isMounted = true;
        let intervalId;

        const fetchAndSetConversation = async () => {
            await fetchConversation(selectedUser.id, false);
            if (isMounted) {
                // Reduce polling frequency to prevent message loss
                intervalId = setInterval(() => {
                    if (selectedUserIdRef.current === selectedUser.id) {
                        // Only refresh from cache or if there might be new messages
                        fetchConversation(selectedUser.id, true);
                    }
                }, 30000); // Increased from 10s to 30s
            }
        };

        fetchAndSetConversation();

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [ selectedUser?.id, fetchConversation ]);

    // Scroll effect - only when messages change
    useEffect(() => {
        scrollToBottom();
    }, [ messages.length, scrollToBottom ]);

    // Connection cleanup effect
    useEffect(() => {
        return () => {
            if (connection) {
                connection.stop().catch(err => {
                    console.error('Error stopping connection:', err);
                });
            }
            clearTimeout(typingTimeoutRef.current);
        };
    }, [ connection ]);

    // Render message status icon
    const renderMessageStatus = (status) => {
        switch (status) {
            case MESSAGE_STATUS.SENDING:
                return <PendingIcon sx={{ fontSize: 12, color: 'text.secondary' }} />;
            case MESSAGE_STATUS.SENT:
                return <CheckIcon sx={{ fontSize: 12, color: 'text.secondary' }} />;
            case MESSAGE_STATUS.DELIVERED:
                return <DeliveredIcon sx={{ fontSize: 12, color: 'success.main' }} />;
            case MESSAGE_STATUS.FAILED:
                return <Typography sx={{ fontSize: 10, color: 'error.main' }}>Failed</Typography>;
            default:
                return null;
        }
    };

    // Update the team message button click handler
    const handleTeamMessageClick = useCallback(() => {
        if (isTeamMessageEnabled) {
            setTeamMessageDialog(true);
        }
    }, [ isTeamMessageEnabled ]);

    // Add the send team message handler
    const handleSendTeamMessage = async (message) => {
        try {
            await sendMessageToTeam(message, tokenRef.current);
            toast.success('Team message sent successfully');
            // Refresh conversations after sending team message
            await Promise.all([
                fetchUnreadMessages(),
                fetchConversations()
            ]);
            setTeamMessageDialog(false);
        } catch (error) {
            console.error('Error sending team message:', error);
            showError('Failed to send team message');
        }
    };

    // Emoji picker handlers
    const handleEmojiPickerClick = (event) => {
        setEmojiAnchorEl(event.currentTarget);
        setShowEmojiPicker((prev) => !prev);
    };

    const handleEmojiSelect = (emojiData) => {
        const emoji = emojiData.emoji;
        const cursor = textFieldRef.current?.selectionStart || newMessage.length;
        const newText = newMessage.slice(0, cursor) + emoji + newMessage.slice(cursor);
        setNewMessage(newText);
        setShowEmojiPicker(false);
    };

    const handleClickAway = () => {
        setShowEmojiPicker(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box className="chat-container" sx={{
                display: 'flex',
                height: '100vh',
                overflow: 'hidden',
                flexDirection: { xs: 'column', md: 'row' },
                bgcolor: 'background.default'
            }}>
                {/* Connection status banner */}
                {connectionState !== 'connected' && (
                    <Alert
                        severity={connectionState === 'reconnecting' ? 'warning' : 'error'}
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            borderRadius: 0
                        }}
                    >
                        {connectionState === 'reconnecting' ? 'Reconnecting...' : 'Connection lost. Messages may be delayed.'}
                    </Alert>
                )}

                {/* Error snackbar */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={5000}
                    onClose={() => setError(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Snackbar>

                {/* Sidebar */}
                <Paper className="chat-sidebar" elevation={2} sx={{
                    width: { xs: '100%', md: 300 },
                    height: { xs: selectedUser ? '0px' : '100vh', md: '100%' },
                    display: { xs: selectedUser ? 'none' : 'flex', md: 'flex' },
                    flexDirection: 'column',
                    borderRight: '1px solid',
                    borderColor: 'secondary.light',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <IconButton
                            onClick={() => {
                                const role = decodeToken(tokenRef.current).role;
                                if (role === 'Leader') {
                                    window.location.href = '/leader-dashboard';
                                }
                                else {
                                    window.location.href = '/member-dashboard';
                                }
                            }}
                            sx={{
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <img src={Logo} alt="FlowSync" style={{ height: 45 }} />
                        <Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                FlowSync
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                                Messaging Platform
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Messages
                            </Typography>
                            {isTeamMessageEnabled && (
                                <Tooltip title="Send message to all team members">
                                    <IconButton
                                        size="small"
                                        onClick={handleTeamMessageClick}
                                        sx={{
                                            '&:hover': { bgcolor: 'primary.light' }
                                        }}
                                    >
                                        <TeamIcon color="action" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        {unreadCount > 0 && (
                            <Chip
                                label={`${unreadCount} unread`}
                                icon={<UnreadIcon />}
                                color="error"
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>

                    <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <ListItem key={index}>
                                    <ListItemAvatar>
                                        <Skeleton variant="circular" width={40} height={40} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<Skeleton width="60%" />}
                                        secondary={<Skeleton width="80%" />}
                                    />
                                </ListItem>
                            ))
                        ) : (
                            sortedUsers.map((user) => {
                                const conversation = conversations.find(conv => conv.userId === user.id);
                                const hasUnread = conversation?.unreadCount > 0;

                                return (
                                    <ListItem
                                        key={user.id}
                                        component="div"
                                        selected={selectedUser?.id === user.id}
                                        onClick={() => setSelectedUser(user)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.light',
                                                '&:hover': {
                                                    backgroundColor: 'primary.light',
                                                }
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            backgroundColor: user.isOnline ? 'success.main' : 'grey.500',
                                                            border: '2px solid white'
                                                        }}
                                                    />
                                                }
                                            >
                                                <Badge
                                                    badgeContent={hasUnread ? conversation.unreadCount : 0}
                                                    color="error"
                                                    max={99}
                                                >
                                                    <Avatar
                                                        src={user.pictureURL}
                                                        alt={user.fullName}
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            border: hasUnread ? 2 : 0,
                                                            borderColor: 'primary.main'
                                                        }}
                                                    >
                                                        {user.fullName[ 0 ]?.toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: hasUnread ? 600 : 400,
                                                            fontSize: '0.95rem'
                                                        }}
                                                    >
                                                        {user.fullName}
                                                    </Typography>
                                                    {user.id === currentUserIdRef.current && (
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                ml: 1,
                                                                color: 'text.secondary',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            (You)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    component="div"
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                            display: 'inline-block',
                                                            fontWeight: hasUnread ? 500 : 400,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: '70%'
                                                        }}
                                                    >
                                                        {conversation?.lastMessage?.length > 30
                                                            ? `${conversation.lastMessage.substring(0, 30)}...`
                                                            : conversation?.lastMessage
                                                        }
                                                    </Typography>
                                                    {conversation?.lastMessageTime && (
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                ml: 1
                                                            }}
                                                        >
                                                            {formatLastMessageTime(conversation.lastMessageTime)}
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                );
                            })
                        )}
                    </List>
                </Paper>

                {/* Main chat area */}
                <Paper className="chat-main" elevation={1} sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: { xs: selectedUser ? '100vh' : '0px', md: '100%' },
                    visibility: { xs: selectedUser ? 'visible' : 'hidden', md: 'visible' },
                    transition: 'all 0.3s ease'
                }}>
                    {selectedUser ? (
                        <>
                            {/* Chat header */}
                            <Box sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderBottom: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 1, sm: 2 }
                            }}>
                                {/* Add back button for mobile */}
                                <IconButton
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        mr: 1
                                    }}
                                    onClick={() => setSelectedUser(null)}
                                >
                                    <ArrowBack />
                                </IconButton>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: selectedUser.isOnline ? 'success.main' : 'grey.500',
                                                border: '2px solid white'
                                            }}
                                        />
                                    }
                                >
                                    <Avatar src={selectedUser.pictureURL} alt={selectedUser.fullName}>
                                        {selectedUser.fullName[ 0 ]?.toUpperCase()}
                                    </Avatar>
                                </Badge>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {selectedUser.fullName}
                                        {selectedUser.id === currentUserIdRef.current && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    ml: 1,
                                                    color: 'text.secondary',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                (You)
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedUser.isOnline ? 'Online' : 'Offline'}
                                    </Typography>
                                </Box>
                                <Box sx={{ ml: 'auto' }}>
                                    <Chip
                                        label={connectionState}
                                        size="small"
                                        color={connectionState === 'connected' ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            <Box
                                className="messages-container"
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    p: { xs: 1.5, sm: 2 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                }}
                            >
                                {messages.map((message) => (
                                    <Box key={message.id} sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        flexDirection: message.isMine ? 'row-reverse' : 'row',
                                        gap: 1,
                                        mb: 0.5
                                    }}>
                                        {/* Avatar - Enhanced positioning */}
                                        <Avatar
                                            src={message.isMine ? currentUser?.pictureURL : selectedUser.pictureURL}
                                            alt={message.isMine ? currentUser?.fullName : selectedUser.fullName}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                mt: 0.5,
                                                flexShrink: 0,
                                                alignSelf: 'flex-start'
                                            }}
                                        >
                                            {message.isMine
                                                ? currentUser?.fullName[ 0 ]?.toUpperCase()
                                                : selectedUser.fullName[ 0 ]?.toUpperCase()
                                            }
                                        </Avatar>

                                        {/* Message content and status */}
                                        <Box sx={{
                                            maxWidth: { xs: '75%', sm: '60%' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: message.isMine ? 'flex-end' : 'flex-start'
                                        }}>
                                            <Box sx={{
                                                bgcolor: message.isMine ? 'primary.main' : 'grey.100',
                                                color: message.isMine ? 'white' : 'text.primary',
                                                borderRadius: message.isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                p: { xs: 1.5, sm: 2 },
                                                maxWidth: '100%',
                                                wordBreak: 'break-word',
                                                position: 'relative'
                                            }}>
                                                <Typography sx={{
                                                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                                    lineHeight: 1.5
                                                }}>
                                                    {message.content}
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                mt: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}>
                                                <Typography variant="caption" sx={{
                                                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                    opacity: 0.7
                                                }}>
                                                    {formatMessageTime(message.timestamp)}
                                                </Typography>
                                                {message.isMine && renderMessageStatus(message.status)}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}

                                {/* Typing indicator - enhanced visibility */}
                                {isTyping && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            flexDirection: 'row',
                                            gap: 1,
                                            mb: 2,
                                            width: '100%',
                                            minHeight: '60px',
                                            pb: 1
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                mt: 0.5,
                                                flexShrink: 0
                                            }}
                                            src={selectedUser.pictureURL}
                                            alt={selectedUser.fullName}
                                        >
                                            {selectedUser.fullName[ 0 ]?.toUpperCase()}
                                        </Avatar>
                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                minWidth: '60px',
                                                bgcolor: 'grey.100',
                                                color: 'text.primary',
                                                borderRadius: '18px 18px 18px 4px',
                                                p: 2,
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: '40px'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    height: '20px'
                                                }}
                                            >
                                                {[ 0, 1, 2 ].map((dot) => (
                                                    <Box
                                                        key={dot}
                                                        sx={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'text.secondary',
                                                            animation: 'bounce 1.4s infinite ease-in-out',
                                                            animationDelay: `${dot * 0.2}s`,
                                                            animationFillMode: 'both',
                                                            '@keyframes bounce': {
                                                                '0%, 80%, 100%': {
                                                                    transform: 'scale(0) translateY(0)',
                                                                    opacity: 0.5
                                                                },
                                                                '40%': {
                                                                    transform: 'scale(1) translateY(-8px)',
                                                                    opacity: 1
                                                                },
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                            {/* Add any additional chat UI elements here */}
                        </>
                    ) : null}

                    {/* Team message dialog */}
                    {isTeamMessageEnabled && (
                        <TeamMessageDialog
                            open={teamMessageDialog}
                            onClose={() => setTeamMessageDialog(false)}
                            onSend={handleSendTeamMessage}
                        />
                    )}

                    {/* Emoji picker popper */}
                    <Popper
                        open={showEmojiPicker}
                        anchorEl={emojiAnchorEl}
                        placement="top-start"
                        disablePortal
                        style={{ zIndex: 1300 }}
                    >
                        <ClickAwayListener onClickAway={handleClickAway}>
                            <Paper elevation={3} sx={{ p: 1 }}>
                                <EmojiPicker
                                    onEmojiClick={handleEmojiSelect}
                                    theme="light"
                                    searchDisabled={false}
                                    width={320}
                                />
                            </Paper>
                        </ClickAwayListener>
                    </Popper>

                    {/* Message input area */}
                    {selectedUser && (
                        <Box
                            component="form"
                            onSubmit={handleSendMessage}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderTop: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: 'background.paper',
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 2
                            }}
                        >
                            <IconButton
                                ref={emojiButtonRef}
                                onClick={handleEmojiPickerClick}
                                sx={{
                                    flexShrink: 0,
                                    mr: 1
                                }}
                                aria-label="Insert emoji"
                            >
                                <EmojiIcon />
                            </IconButton>
                            <TextField
                                inputRef={textFieldRef}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleTyping}
                                placeholder="Type your message..."
                                variant="outlined"
                                size="small"
                                fullWidth
                                autoFocus
                                sx={{
                                    bgcolor: 'background.default',
                                    borderRadius: 2,
                                    flexGrow: 1,
                                }}
                                inputProps={{
                                    maxLength: 1000
                                }}
                            />
                            <IconButton
                                type="submit"
                                color="primary"
                                disabled={!newMessage.trim()}
                                sx={{
                                    flexShrink: 0,
                                    ml: 1,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 40,
                                    height: 40,
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'grey.300',
                                        color: 'grey.500'
                                    }
                                }}
                                aria-label="Send message"
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    )}
                    <div ref={messageEndRef} />
                </Paper>

                {!selectedUser && (
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        p: 3,
                        flex: 1,
                        bgcolor: 'white',
                        position: 'absolute',
                        top: '50%',
                        left: '58%',
                        transform: 'translate(-58%, -50%)',
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxWidth: '400px'
                        }}>
                            <img
                                src={Logo}
                                alt="FlowSync Logo"
                                style={{
                                    width: '120px',
                                    marginBottom: '24px'
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    mb: 2
                                }}
                            >
                                Welcome to FlowSync Chat
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ px: 3 }}
                            >
                                Select a conversation from the left to start messaging.
                                Stay connected with your team members in real-time.
                            </Typography>
                        </Box>
                    </Box>
                )}

            </Box>
        </ThemeProvider>
    );
};

export default Chat;
