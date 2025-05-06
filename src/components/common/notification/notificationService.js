import axios from 'axios';

const BASE_URL = 'https://localhost:55914/api';

export const getNotifications = async (token) => {
    return await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export const markAsRead = async (token, notificationId) => {
    return await axios.post(`${BASE_URL}/notifications/mark-as-read/${notificationId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export const markAllAsRead = async (token) => {
    return await axios.post(`${BASE_URL}/notifications/mark-all-as-read`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
}
