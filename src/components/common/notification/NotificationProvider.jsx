import React, { useState } from "react";
import { NotificationContext } from "./NotificationContext";

const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'task',
            title: 'New Task Assigned',
            message: 'You have been assigned a new task',
            time: '5 min ago',
            read: false
        },
        {
            id: 2,
            type: 'alert',
            title: 'Task Deadline Updated',
            message: 'The deadline for task "Frontend Development" has been updated',
            time: '10 min ago',
            read: false
        }
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
