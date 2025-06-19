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
    ClickAwayListener,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    Send as SendIcon,
    Circle as UnreadIcon,
    CheckCircle as DeliveredIcon,
    Schedule as PendingIcon,
    Check as CheckIcon,
    People as TeamIcon,
    ArrowBack,
    InsertEmoticon as EmojiIcon,
    ContentCopy as ContentCopyIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ForwardToInbox as ForwardToInboxIcon
} from '@mui/icons-material';
import { sendMessage, getConversation, getUnreadMessages, markMessagesAsRead, getChatUsers, sendMessageToTeam, editMessage, deleteMessage } from '../../../services/chatService';
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

const LOCAL_META_KEY = 'chatMessageMeta';

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

// --- localStorage meta helpers ---
function getMetaMap() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_META_KEY) || '{}');
    } catch {
        return {};
    }
}
function saveMetaToLocalStorage(messageId, meta) {
    const metaMap = getMetaMap();
    metaMap[ messageId ] = { ...metaMap[ messageId ], ...meta };
    localStorage.setItem(LOCAL_META_KEY, JSON.stringify(metaMap));
}
function removeMetaFromLocalStorage(messageId) {
    const metaMap = getMetaMap();
    delete metaMap[ messageId ];
    localStorage.setItem(LOCAL_META_KEY, JSON.stringify(metaMap));
}
function mergeMetaFromLocalStorage(messages) {
    const metaMap = getMetaMap();
    return messages.map(msg => ({
        ...msg,
        ...metaMap[ msg.id ]
    }));
}
// --- end localStorage meta helpers ---

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
            const role = decodeToken(token).role;
            return role.includes('Leader');
        } catch (error) {
            console.error('Error decoding token:', error);
            return false;
        }
    });
    const [ teamMessageDialog, setTeamMessageDialog ] = useState(false);
    const [ showEmojiPicker, setShowEmojiPicker ] = useState(false);
    const [ emojiAnchorEl, setEmojiAnchorEl ] = useState(null);
    const [ menuAnchorEl, setMenuAnchorEl ] = useState(null);
    const [ selectedMsg, setSelectedMsg ] = useState(null);
    const [ editMode, setEditMode ] = useState(false);
    const [ editText, setEditText ] = useState('');
    const [ copyTooltip, setCopyTooltip ] = useState(false);
    const [ tooltipAnchor, setTooltipAnchor ] = useState(null);
    const [ forwardDialog, setForwardDialog ] = useState(false);

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
            const aHasUnread = conversations.some(conv => conv.userId === a.id && conv.unreadCount > 0);
            const bHasUnread = conversations.some(conv => conv.userId === b.id && conv.unreadCount > 0);

            if (aHasUnread && !bHasUnread) return -1;
            if (!aHasUnread && bHasUnread) return 1;

            const aLastMessage = conversations.find(conv => conv.userId === a.id)?.lastMessageTime || 0;
            const bLastMessage = conversations.find(conv => conv.userId === b.id)?.lastMessageTime || 0;
            return new Date(bLastMessage) - new Date(aLastMessage);
        });
    }, [ users, conversations ]);

    const showError = useCallback((message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    }, []);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

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

    const fetchUnreadMessages = useCallback(async () => {
        try {
            const response = await getUnreadMessages(tokenRef.current);
            setUnreadCount(response.data.length);
        } catch (error) {
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
                if (!acc[ msg.senderId ].lastMessageTime ||
                    new Date(msg.timestamp) > new Date(acc[ msg.senderId ].lastMessageTime)) {
                    acc[ msg.senderId ].lastMessage = msg.content;
                    acc[ msg.senderId ].lastMessageTime = msg.timestamp;
                }
                return acc;
            }, {});
            setConversations(Object.values(conversationsMap));
        } catch (error) { }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await getChatUsers(tokenRef.current);
            setUsers(response.data);
        } catch (error) {
            showError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [ showError ]);

    function getMeta(msg) {
        return {
            edited: msg.edited || msg.isEdited || false,
            deleted: msg.deleted || msg.isDeleted || false,
            deletedBy: msg.deletedBy || null,
            forwarded: msg.forwarded || msg.isForwarded || false,
            forwardedBy: msg.forwardedBy || null,
        };
    }

    function ensureMeta(msg) {
        const metaMap = getMetaMap();
        return {
            ...msg,
            ...metaMap[ msg.id ]
        };
    }

    const fetchConversation = useCallback(async (userId, fromCache = true) => {
        if (fromCache && conversationCacheRef.current.has(userId)) {
            const cachedData = conversationCacheRef.current.get(userId);
            if (Date.now() - cachedData.timestamp < 30000) {
                setMessages(mergeMetaFromLocalStorage(cachedData.messages));
                return;
            }
        }

        try {
            const response = await getConversation(userId, tokenRef.current);

            let messagesData;

            if (Array.isArray(response.data)) {
                messagesData = response.data.map(msg => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content || msg.message,
                    timestamp: msg.timestamp || msg.sentAt,
                    isRead: msg.isRead,
                    isMine: msg.isMine,
                    status: msg.isMine ? MESSAGE_STATUS.DELIVERED : undefined,
                    ...getMeta(msg)
                }));
            } else if (response.data && Array.isArray(response.data.messages)) {
                messagesData = response.data.messages.map(msg => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content || msg.message,
                    timestamp: msg.timestamp || msg.sentAt,
                    isRead: msg.isRead,
                    isMine: msg.isMine,
                    status: msg.isMine ? MESSAGE_STATUS.DELIVERED : undefined,
                    ...getMeta(msg)
                }));
            } else {
                messagesData = [];
            }

            messagesData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(mergeMetaFromLocalStorage(messagesData));

            conversationCacheRef.current.set(userId, {
                messages: messagesData,
                timestamp: Date.now()
            });

            const unreadMessageIds = messagesData
                .filter(m => !m.isRead && !m.isMine)
                .map(m => m.id);

            if (unreadMessageIds.length > 0) {
                await markMessagesAsRead(unreadMessageIds, tokenRef.current);
                fetchUnreadMessages();
                fetchConversations();
            }
        } catch (error) {
            showError('Failed to load conversation');
        }
    }, [ fetchUnreadMessages, fetchConversations, showError ]);

    const sendTypingNotification = useCallback((isTypingValue) => {
        if (connection?.state === signalR.HubConnectionState.Connected && selectedUserIdRef.current) {
            connection.invoke("Typing", selectedUserIdRef.current, isTypingValue)
                .catch(err => {
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

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setNewMessage('');

        if (isTeamMessage && isTeamMessageEnabled) {
            try {
                await sendMessageToTeam(messageContent, tokenRef.current);
                toast.success('Team message sent successfully');
                setIsTeamMessage(false);
            } catch (error) {
                showError('Failed to send team message');
            }
            return;
        }

        if (!selectedUser) return;

        const isSelfMessage = selectedUser.id === currentUserIdRef.current;

        const tempMessage = ensureMeta({
            id: tempId,
            senderId: currentUserIdRef.current,
            content: messageContent,
            timestamp: new Date().toISOString(),
            isRead: true,
            isMine: true,
            status: MESSAGE_STATUS.SENDING
        });

        setMessages(prev => [ ...prev, tempMessage ]);
        scrollToBottom();

        try {
            const response = await sendMessage(selectedUser.id, messageContent, tokenRef.current);
            const sentMessageId = response.data?.id || response.data?.messageId;

            if (!isSelfMessage) {
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId
                        ? ensureMeta({ ...msg, id: sentMessageId || tempId, status: MESSAGE_STATUS.DELIVERED })
                        : msg
                ));
            }

            conversationCacheRef.current.delete(selectedUser.id);

        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === tempId
                    ? ensureMeta({ ...msg, status: MESSAGE_STATUS.FAILED })
                    : msg
            ));
            showError('Failed to send message. Please try again.');
        }
    }, [ newMessage, selectedUser, isTeamMessage, isTeamMessageEnabled, showError ]);

    // SignalR connection management
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

                newConnection.on("UserTyping", (userId, isTypingValue) => {
                    if (isMounted && selectedUserIdRef.current === userId) {
                        setIsTyping(isTypingValue);
                    }
                });

                newConnection.on("ReceiveMessage", async (senderId, messageContent, messageId, timestamp, isMine, meta) => {
                    if (!isMounted) return;
                    const isSelfMessage = senderId === currentUserIdRef.current;
                    if (isMine && !isSelfMessage) return;

                    // Enhanced meta data handling
                    const metaData = meta || {};
                    const enhancedMeta = {
                        edited: metaData.edited || metaData.isEdited || false,
                        deleted: metaData.deleted || metaData.isDeleted || false,
                        deletedBy: metaData.deletedBy || null,
                        forwarded: metaData.forwarded || metaData.isForwarded || false,
                        forwardedBy: metaData.forwardedBy || null,
                        originalSenderId: metaData.originalSenderId || null, // For forwarded messages
                        forwardedFromName: metaData.forwardedFromName || null, // Original sender name for forwarded messages
                    };

                    if (selectedUserIdRef.current === senderId) {
                        setMessages(prev => {
                            if (isSelfMessage) {
                                const existingTempIndex = prev.findIndex(m =>
                                    m.content === messageContent &&
                                    m.senderId === senderId &&
                                    m.id.toString().startsWith('temp-')
                                );
                                if (existingTempIndex !== -1) {
                                    const newMessages = [ ...prev ];
                                    newMessages[ existingTempIndex ] = ensureMeta({
                                        id: messageId,
                                        senderId,
                                        content: messageContent,
                                        timestamp,
                                        isRead: true,
                                        isMine: true,
                                        status: MESSAGE_STATUS.DELIVERED,
                                        ...enhancedMeta
                                    });
                                    return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                }
                            }

                            if (prev.some(m => m.id === messageId)) return prev;

                            const newMsg = ensureMeta({
                                id: messageId,
                                senderId,
                                content: messageContent,
                                timestamp,
                                isRead: selectedUserIdRef.current === senderId,
                                isMine,
                                ...enhancedMeta
                            });

                            const newMessages = [ ...prev, newMsg ];
                            return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                        });

                        setTimeout(() => {
                            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);

                        try {
                            await markMessagesAsRead([ messageId ], tokenRef.current);
                        } catch (error) { }
                    } else {
                        fetchUnreadMessages();
                        fetchConversations();
                    }
                });

                await newConnection.start();

                if (isMounted) {
                    setConnectionState('connected');
                    setConnection(newConnection);
                }

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
                if (isMounted) {
                    setConnectionState('disconnected');
                }
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
                connection.stop().catch(() => { });
            }
            clearTimeout(typingTimeoutRef.current);
        };
    }, []);

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
            } catch (error) { }
        };

        fetchData();

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

    useEffect(() => {
        if (!selectedUser?.id) return;

        let isMounted = true;
        let intervalId;

        const fetchAndSetConversation = async () => {
            await fetchConversation(selectedUser.id, false);
            if (isMounted) {
                intervalId = setInterval(() => {
                    if (selectedUserIdRef.current === selectedUser.id) {
                        fetchConversation(selectedUser.id, true);
                    }
                }, 30000);
            }
        };

        fetchAndSetConversation();

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [ selectedUser?.id, fetchConversation ]);

    useEffect(() => {
        scrollToBottom();
    }, [ messages.length, scrollToBottom ]);

    useEffect(() => {
        return () => {
            if (connection) {
                connection.stop().catch(() => { });
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

    const handleTeamMessageClick = useCallback(() => {
        if (isTeamMessageEnabled) {
            setTeamMessageDialog(true);
        }
    }, [ isTeamMessageEnabled ]);

    const handleSendTeamMessage = async (message) => {
        try {
            await sendMessageToTeam(message, tokenRef.current);
            toast.success('Team message sent successfully');
            await Promise.all([
                fetchUnreadMessages(),
                fetchConversations()
            ]);
            setTeamMessageDialog(false);
        } catch (error) {
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

    // Message options menu handlers
    const handleMsgMenuOpen = (event, msg) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedMsg(msg);
    };
    const handleMsgMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedMsg(null);
        setEditMode(false);
        setEditText('');
    };
    const handleCopy = (event) => {
        if (!selectedMsg || !selectedMsg.content) return;
        navigator.clipboard.writeText(selectedMsg.content);
        setTooltipAnchor(event ? event.currentTarget : menuAnchorEl);
        setCopyTooltip(true);
        setTimeout(() => setCopyTooltip(false), 1200);
        handleMsgMenuClose();
    };
    const handleEdit = () => {
        setEditMode(true);
        setEditText(selectedMsg?.content || '');
        setMenuAnchorEl(null);
    };
    const handleEditSubmit = async () => {
        try {
            await editMessage(selectedMsg.id, editText, tokenRef.current);
            saveMetaToLocalStorage(selectedMsg.id, { edited: true });
            setMessages(prev =>
                mergeMetaFromLocalStorage(
                    prev.map(m =>
                        m.id === selectedMsg.id
                            ? { ...m, content: editText }
                            : m
                    )
                )
            );
            setEditMode(false);
            setSelectedMsg(null);
            setEditText('');
        } catch (err) {
            showError('Failed to edit message');
        }
    };
    const handleEditCheckClick = async () => {
        await handleEditSubmit();
    };
    const handleDelete = async () => {
    try {
        await deleteMessage(selectedMsg.id, tokenRef.current);
        
        // Save who deleted it with timestamp
        saveMetaToLocalStorage(selectedMsg.id, {
            deleted: true,
            deletedBy: currentUserIdRef.current,
            deletedAt: new Date().toISOString()
        });
        
        setMessages(prev =>
            mergeMetaFromLocalStorage(
                prev.map(m =>
                    m.id === selectedMsg.id
                        ? { ...m, content: '' } // Clear content for deleted messages
                        : m
                )
            )
        );
        handleMsgMenuClose();
    } catch (err) {
        showError('Failed to delete message');
    }
};
    const handleForward = () => {
        if (!selectedMsg?.content) {
            showError('Cannot forward empty message');
            return;
        }
        setForwardDialog(true);
        setMenuAnchorEl(null);
    };
    const handleForwardSend = async (userId) => {
    if (!selectedMsg?.content) {
        showError('Cannot forward empty message');
        return;
    }
    try {
        // Get the original sender info for forwarded message attribution
        const originalSenderName = selectedMsg.forwarded 
            ? selectedMsg.forwardedFromName || getUserNameById(selectedMsg.originalSenderId)
            : getUserNameById(selectedMsg.senderId);
        
        // Send the message with forward metadata
        const response = await sendMessage(userId, selectedMsg.content, tokenRef.current);
        const forwardedId = response.data?.id || response.data?.messageId;
        
        // Save comprehensive forward metadata
        saveMetaToLocalStorage(forwardedId, { 
            forwarded: true, 
            forwardedBy: currentUserIdRef.current,
            originalSenderId: selectedMsg.forwarded ? selectedMsg.originalSenderId : selectedMsg.senderId,
            forwardedFromName: originalSenderName
        });
        
        toast.success('Message forwarded');
        setForwardDialog(false);
        setSelectedMsg(null);
    } catch (err) {
        showError('Failed to forward message');
    }
};


    const handleMessageContextMenu = (event, message) => {
        event.preventDefault();
        if (message.isMine) {
            setMenuAnchorEl(event.currentTarget);
            setSelectedMsg(message);
        }
    };

    // For showing the name of a user by userId (for deleted/forwardedBy)
    const getUserNameById = (id) => {
    if (!id) return 'Unknown';
    if (id === currentUserIdRef.current) return 'You';
    const user = users.find(u => u.id === id);
    return user ? user.fullName : 'Unknown User';
};

    // For deleted messages, show "You deleted a message" or "{name} deleted a message"
    const getDeletedMessageText = (msg) => {
    if (msg.deletedBy) {
        const deleterName = getUserNameById(msg.deletedBy);
        return `${deleterName} deleted this message`;
    }
    return "This message was deleted";
};

    // For forwarded messages, show "Forwarded by {name}"
    const getForwardedByText = (msg) => {
        if (!msg.forwarded) return null;
        return `Forwarded by ${getUserNameById(msg.forwardedBy)}`;
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
                                if (role.includes('Leader')) {
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
                            <Box sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderBottom: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 1, sm: 2 }
                            }}>
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
                                    <Box
                                        key={message.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            flexDirection: message.isMine ? 'row-reverse' : 'row',
                                            gap: 1,
                                            mb: 0.5,
                                            position: 'relative'
                                        }}
                                        onContextMenu={e => handleMessageContextMenu(e, message)}
                                    >
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
                                        <Box sx={{
                                            maxWidth: { xs: '75%', sm: '60%' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: message.isMine ? 'flex-end' : 'flex-start',
                                            position: 'relative'
                                        }}>
                                            {/* Meta labels above the message */}
                                            {(message.edited || message.forwarded) && (
                                                <Box sx={{ mb: 0.5, display: "flex", gap: 1, alignItems: "center" }}>
                                                    {message.edited && (
                                                        <Chip label="Edited" size="small" color="info" sx={{ fontWeight: 600, fontSize: 13 }} />
                                                    )}
                                                    {message.forwarded && (
                                                        <Chip
                                                            label={getForwardedByText(message)}
                                                            size="small"
                                                            color="secondary"
                                                            sx={{ fontWeight: 600, fontSize: 13 }}
                                                        />
                                                    )}
                                                </Box>
                                            )}
                                            <Box sx={{
                                                bgcolor: message.isMine ? 'primary.main' : 'grey.100',
                                                color: message.isMine ? 'white' : 'text.primary',
                                                borderRadius: message.isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                p: { xs: 1.5, sm: 2 },
                                                maxWidth: '100%',
                                                wordBreak: 'break-word',
                                                position: 'relative',
                                                opacity: message.deleted ? 0.6 : 1,
                                                cursor: message.isMine ? 'pointer' : 'default'
                                            }}>
                                                {editMode && selectedMsg?.id === message.id ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <textarea
                                                            rows={3}
                                                            style={{
                                                                width: '100%',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: 8,
                                                                padding: 8,
                                                                fontFamily: 'inherit',
                                                                fontSize: '1rem',
                                                                background: theme.palette.background.paper,
                                                                marginRight: 8,
                                                                resize: 'none'
                                                            }}
                                                            autoFocus
                                                            value={editText}
                                                            onChange={e => setEditText(e.target.value)}
                                                        />
                                                        <IconButton sx={{ bgcolor: 'white', color: '#064e3b', ml: '5px' }} size="small" onClick={handleEditCheckClick}>
                                                            <CheckIcon />
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                                            lineHeight: 1.5,
                                                            fontStyle: message.deleted ? 'italic' : 'normal',
                                                            color: message.deleted ? 'text.secondary' : undefined,
                                                            whiteSpace: 'pre-line'
                                                        }}
                                                        onClick={message.isMine && !message.deleted ? (e) => handleMsgMenuOpen(e, message) : undefined}
                                                    >
                                                        {message.deleted
                                                            ? getDeletedMessageText(message)
                                                            : message.content}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 0.5,
                                                justifyContent: message.isMine ? 'flex-end' : 'flex-start'
                                            }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatMessageTime(message.timestamp)}
                                                </Typography>
                                                {message.isMine && renderMessageStatus(message.status)}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
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
                        </>
                    ) : null}

                    {isTeamMessageEnabled && (
                        <TeamMessageDialog
                            open={teamMessageDialog}
                            onClose={() => setTeamMessageDialog(false)}
                            onSend={handleSendTeamMessage}
                        />
                    )}

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

                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMsgMenuClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    getContentAnchorEl={null}
                    PaperProps={{
                        style: {
                            zIndex: 1500
                        }
                    }}
                >
                    <MenuItem onClick={handleCopy}>
                        <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                        Copy
                    </MenuItem>
                    <MenuItem onClick={handleEdit}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                        Delete
                    </MenuItem>
                    <MenuItem onClick={handleForward}>
                        <ForwardToInboxIcon fontSize="small" sx={{ mr: 1 }} />
                        Forward
                    </MenuItem>
                </Menu>
                <Tooltip
                    open={copyTooltip}
                    title="Copied!"
                    arrow
                    placement="top"
                    PopperProps={{
                        anchorEl: tooltipAnchor,
                    }}
                >
                    <span style={{ position: 'absolute', left: -9999, top: -9999 }} />
                </Tooltip>

                <Dialog
                    open={forwardDialog}
                    onClose={() => setForwardDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Forward Message</DialogTitle>
                    <DialogContent>
                        <List>
                            {users.filter(u => u.id !== currentUserIdRef.current).map(user => (
                                <ListItem
                                    key={user.id}
                                    secondaryAction={
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleForwardSend(user.id)}
                                        >
                                            Send
                                        </Button>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={user.pictureURL}>
                                            {user.fullName[ 0 ]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={user.fullName}
                                        secondary={user.email}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setForwardDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
};

export default Chat;