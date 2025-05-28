/* eslint-disable no-unused-vars */
import { createContext } from 'react';

export const NotificationTypes = {
    SignUpRequest: 'SignUpRequest',
    Approval: 'Approval',
    Rejection: 'Rejection',
    CompleteTaskRequest: 'CompleteTaskRequest',
    FreezeTaskRequest: 'FreezeTaskRequest',
    Info: 'Info',
    Warning: 'Warning',
    Error: 'Error',
    Security: 'Security',
    Reminder: 'Reminder',
};

export const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    isSecurityNotificationsEnabled: false,
    markAsRead: (notificationId) => {},
    markAllAsRead: () => {},
    addNotification: (notification) => {},
    clearNotification: (notificationId) => {},
    fetchNotifications: () => {},
    toggleSecurityNotifications: () => {},
});
