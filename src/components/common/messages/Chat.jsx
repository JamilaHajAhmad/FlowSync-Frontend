import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField, IconButton, Typography, Avatar, List, ListItem, ListItemText, ListItemAvatar, Badge, Divider } from '@mui/material';
import { Send as SendIcon, Circle as UnreadIcon } from '@mui/icons-material';
import { sendMessage, getConversation, getUnreadMessages, markMessagesAsRead } from '../../../services/chatService';
import './Chat.css';

export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const messageEndRef = useRef(null);
    const currentUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchConversation(selectedUser.id);
            const interval = setInterval(() => fetchConversation(selectedUser.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchUnreadMessages = async () => {
        try {
            const response = await getUnreadMessages(token);
            setUnreadCount(response.data.length);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const fetchConversation = async (userId) => {
        try {
            const response = await getConversation(userId, token);
            setMessages(response.data);
            // Mark messages as read
            const unreadMessageIds = response.data
                .filter(m => !m.isRead && m.senderId === userId)
                .map(m => m.id);
            if (unreadMessageIds.length > 0) {
                await markMessagesAsRead(unreadMessageIds, token);
                fetchUnreadMessages();
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            await sendMessage(selectedUser.id, newMessage.trim(), token);
            setNewMessage('');
            fetchConversation(selectedUser.id);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <Box className="chat-container">
            <Paper className="chat-sidebar">
                <Typography variant="h6" className="chat-sidebar-header">
                    Conversations
                </Typography>
                <List>
                    {conversations.map((user) => (
                        <ListItem
                            key={user.id}
                            button
                            selected={selectedUser?.id === user.id}
                            onClick={() => setSelectedUser(user)}
                        >
                            <ListItemAvatar>
                                <Badge
                                    color="error"
                                    variant="dot"
                                    invisible={!user.hasUnread}
                                >
                                    <Avatar>{user.name[0]}</Avatar>
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.name}
                                secondary={user.lastMessage}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Paper className="chat-main">
                {selectedUser ? (
                    <>
                        <Box className="chat-header">
                            <Typography variant="h6">{selectedUser.name}</Typography>
                        </Box>
                        <Box className="messages-container">
                            {messages.map((message) => (
                                <Box
                                    key={message.id}
                                    className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
                                >
                                    <Typography className="message-text">
                                        {message.content}
                                    </Typography>
                                    <Typography variant="caption" className="message-time">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            ))}
                            <div ref={messageEndRef} />
                        </Box>
                        <Box
                            component="form"
                            onSubmit={handleSendMessage}
                            className="chat-input"
                        >
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                size="small"
                            />
                            <IconButton
                                color="primary"
                                type="submit"
                                disabled={!newMessage.trim()}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box className="no-chat-selected">
                        <Typography variant="h6" color="textSecondary">
                            Select a conversation to start chatting
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}