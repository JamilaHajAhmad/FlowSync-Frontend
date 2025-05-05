import React, { useState, useCallback, useEffect } from 'react';
import { NotificationContext } from './NotificationContext';
import { getNotifications, markAsRead as markAsReadApi } from './notificationService';

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const token = localStorage.getItem('authToken');
    
    // Update unread count whenever notifications change
    useEffect(() => {
        const newUnreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadCount(newUnreadCount);
    }, [notifications]);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await getNotifications(token);
            console.log('Fetched notifications:', response.data);
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await markAsReadApi(token, notificationId);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error; // Allow component to handle the error
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({
                ...notification,
                isRead: true
            }))
        );
    };

    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const clearNotification = (notificationId) => {
        setNotifications(prev =>
            prev.filter(notif => notif.id !== notificationId)
        );
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount, // This will now be reactive
                markAsRead,
                markAllAsRead,
                addNotification,
                clearNotification,
                fetchNotifications,
                hasUnread: unreadCount > 0 // Add this helper property
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};