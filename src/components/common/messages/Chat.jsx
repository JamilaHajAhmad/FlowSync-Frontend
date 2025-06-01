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
    Snackbar
} from '@mui/material';
import {
    Send as SendIcon,
    Circle as UnreadIcon,
    CheckCircle as DeliveredIcon,
    Schedule as PendingIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { sendMessage, getConversation, getUnreadMessages, markMessagesAsRead, getChatUsers } from '../../../services/chatService';
import * as signalR from '@microsoft/signalr';
import './Chat.css';

// Message status constants
const MESSAGE_STATUS = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed'
};

export default function Chat() {
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

    // Refs
    const messageEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const conversationCacheRef = useRef(new Map());
    const selectedUserIdRef = useRef(null);

    // Constants - moved to refs to prevent recreating on each render
    const currentUserIdRef = useRef(localStorage.getItem('userId'));
    const tokenRef = useRef(localStorage.getItem('authToken'));

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
        if (!newMessage.trim() || !selectedUser) return;

        const messageContent = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setNewMessage('');

        // Optimistic update
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

            // Update message status to delivered
            setMessages(prev => prev.map(msg =>
                msg.id === tempId
                    ? { ...msg, id: sentMessageId || tempId, status: MESSAGE_STATUS.DELIVERED }
                    : msg
            ));

            // Clear cache for this conversation to force refresh
            conversationCacheRef.current.delete(selectedUser.id);

        } catch (error) {
            console.error('Error sending message:', error);

            // Update message status to failed
            setMessages(prev => prev.map(msg =>
                msg.id === tempId
                    ? { ...msg, status: MESSAGE_STATUS.FAILED }
                    : msg
            ));

            showError('Failed to send message. Please try again.');
        }
    }, [ newMessage, selectedUser, scrollToBottom, showError ]);

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

                newConnection.on("ReceiveMessage", async (senderId, messageContent, messageId, timestamp, isMine) => {
                    if (!isMounted) return;

                    const newMsg = {
                        id: messageId,
                        senderId,
                        content: messageContent,
                        timestamp,
                        isRead: selectedUserIdRef.current === senderId,
                        isMine
                    };

                    if (selectedUserIdRef.current === senderId) {
                        setMessages(prev => {
                            // Check if message already exists to prevent duplicates
                            if (prev.some(m => m.id === messageId)) return prev;

                            // Add new message and sort by timestamp
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

    return (
        <Box className="chat-container" >
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
            <Paper className="chat-sidebar" elevation={2}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Messages
                    </Typography>
                    {unreadCount > 0 && (
                        <Chip
                            label={`${unreadCount} unread`}
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
                                            <Typography
                                                sx={{
                                                    fontWeight: hasUnread ? 600 : 400,
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {user.fullName}
                                            </Typography>
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
            <Paper className="chat-main" elevation={1}>
                {selectedUser ? (
                    <>
                        {/* Chat header */}
                        <Box
                            sx={{
                                p: 2,
                                borderBottom: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
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
                                overflow: 'auto',
                                p: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0
                            }}
                        >
                            {messages.map((message, index) => {
                                const isOwn = message.isMine;
                                const showAvatar = !isOwn && (
                                    index === 0 ||
                                    messages[ index - 1 ].isMine
                                );

                                return (
                                    <Box
                                        key={message.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                            mb: 1,
                                            alignItems: 'flex-end'
                                        }}
                                    >
                                        {!isOwn && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    mr: 1,
                                                    visibility: showAvatar ? 'visible' : 'hidden'
                                                }}
                                                src={selectedUser.pictureURL}
                                                alt={selectedUser.fullName}
                                            >
                                                {selectedUser.fullName[ 0 ]?.toUpperCase()}
                                            </Avatar>
                                        )}

                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                bgcolor: isOwn ? 'primary.main' : 'grey.100',
                                                color: isOwn ? 'primary.contrastText' : 'text.primary',
                                                borderRadius: 2,
                                                p: 1.5,
                                                position: 'relative'
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {message.content}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mt: 0.5,
                                                    gap: 1
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        opacity: 0.7,
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {formatMessageTime(message.timestamp)}
                                                </Typography>
                                                {isOwn && renderMessageStatus(message.status)}
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}

                            {/* Typing indicator - enhanced visibility */}
                            {isTyping && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        mb: 2, // Increased margin bottom
                                        alignItems: 'flex-end',
                                        width: '100%', // Ensure full width
                                        minHeight: '60px', // Minimum height to prevent cutoff
                                        pb: 1 // Add padding bottom
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            mr: 1,
                                            flexShrink: 0 // Prevent avatar from shrinking
                                        }}
                                        src={selectedUser.pictureURL}
                                        alt={selectedUser.fullName}
                                    >
                                        {selectedUser.fullName[ 0 ]?.toUpperCase()}
                                    </Avatar>
                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            minWidth: '60px', // Minimum width for typing indicator
                                            bgcolor: 'grey.100',
                                            color: 'text.primary',
                                            borderRadius: 2,
                                            p: 2, // Increased padding
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: '40px' // Minimum height for the bubble
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px', // Slightly increased gap
                                                height: '20px' // Fixed height for animation container
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

                            <div ref={messageEndRef} />
                        </Box>

                        {/* Message input */}
                        <Box
                            component="form"
                            onSubmit={handleSendMessage}
                            sx={{
                                p: 2,
                                borderTop: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                gap: 1,
                                alignItems: 'flex-end'
                            }}
                        >
                            <TextField
                                fullWidth
                                multiline
                                maxRows={4}
                                variant="outlined"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3
                                    }
                                }}
                            />
                            <IconButton
                                color="primary"
                                type="submit"
                                disabled={!newMessage.trim()}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'grey.300'
                                    }
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center'
                        }}
                    >
                        <Box>
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                Welcome to Chat! 💬
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Select a conversation from the sidebar to start chatting
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}