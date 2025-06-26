import api from './api';

export const getNotifications = async (token) => {
    return await api.get(`/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export const markAsRead = async (token, notificationId) => {
    return await api.post(`/notifications/mark-as-read/${notificationId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export const markAllAsRead = async (token) => {
    return await api.post(`/notifications/mark-all-as-read`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
}
