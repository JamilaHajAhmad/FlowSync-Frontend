import { createContext } from 'react';

export const NotificationContext = createContext({
    notifications: [],
    markAsRead: () => {},
    markAllAsRead: () => {},
    addNotification: () => {},
    clearNotification: () => {}
});