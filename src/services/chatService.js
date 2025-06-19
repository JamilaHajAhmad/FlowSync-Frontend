import api from './api';

export const sendMessage = async (receiverId, message, token) => {
    return await api.post(`/chat/send`, {
        receiverId,
        message
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getConversation = async (userId, token) => {
    return await api.get(`/chat/conversation?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getUnreadMessages = async (token) => {
    return await api.get(`/chat/unread`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const markMessagesAsRead = async (messageIds, token) => {
    return await api.post(`/chat/mark-as-read`, messageIds, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getChatUsers = async (token) => {
    return await api.get('/chat/users', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const sendMessageToTeam = async (message, token) => {
    return await api.post(
        '/chat/send-to-team',
        { message },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
};

export const editMessage = async (messageId, newContent, token) => {
    return await api.put(
        `/chat/edit/${messageId}`,
        { message: newContent },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
};

export const deleteMessage = async (messageId, token) => {
    return await api.delete(`/chat/delete/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};