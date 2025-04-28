import React, { useState } from "react";
import { NotificationContext } from "./NotificationContext";

const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([
    ]);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification => 
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const addNotification = (notification) => {
        setNotifications(prev => [
            {
                id: Date.now(),
                read: false,
                time: 'Just now',
                ...notification
            },
            ...prev
        ]);
    };

    const clearNotification = (id) => {
        setNotifications(prev => 
            prev.filter(notification => notification.id !== id)
        );
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    return (
        <NotificationContext.Provider 
            value={{ 
                notifications, 
                markAsRead, 
                markAllAsRead,
                addNotification, 
                clearNotification,
                clearAllNotifications 
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
